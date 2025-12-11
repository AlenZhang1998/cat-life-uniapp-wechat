import { getBaseUrl } from './request';

type UploadFeedbackResponse =
  | {
      success: true;
      data: string[];
    }
  | {
      success: false;
      error?: string;
    }
  | Record<string, any>;

const parseUploadResponse = (raw: string) => {
  try {
    return JSON.parse(raw) as UploadFeedbackResponse;
  } catch {
    return null;
  }
};

const buildAuthHeader = () => {
  const token = uni.getStorageSync('token');
  if (!token) {
    return '';
  }
  return token.startsWith('Bearer ') ? token : `Bearer ${token}`;
};

/**
 * 把小程序临时图片路径上传到后端，后端再传 COS。
 * @param filePaths  chooseImage 返回的本地临时路径
 */
export const uploadImagesToCos = async (filePaths: string[]) => {
  if (!filePaths.length) return [];

  const authHeader = buildAuthHeader();
  if (!authHeader) {
    throw new Error('no token for upload');
  }

  const uploadMulti = (filePath: string) =>
    new Promise<string>((resolve, reject) => {
      uni.uploadFile({
        url: `${getBaseUrl()}/api/upload/feedback-image`,
        filePath,
        name: 'files', // 后端使用 upload.array('files', 3)
        header: {
          Authorization: authHeader,
        },
        success: (res) => {
          if (res.statusCode < 200 || res.statusCode >= 300) {
            reject(new Error(`upload failed (${res.statusCode})`));
            return;
          }
          const parsed = parseUploadResponse(res.data as string);
          const urlFromArray =
            parsed && 'data' in parsed && Array.isArray(parsed.data)
              ? parsed.data[0]
              : undefined;
          const urlDirect =
            parsed &&
            'url' in parsed &&
            typeof parsed.url === 'string' &&
            parsed.url;

          if (urlFromArray || urlDirect) {
            resolve((urlFromArray || urlDirect) as string);
            return;
          }

          const errorMessage =
            parsed && 'error' in parsed && typeof parsed.error === 'string'
              ? parsed.error
              : 'upload response invalid';
          reject(new Error(errorMessage));
        },
        fail: (err) => {
          reject(new Error(err.errMsg || 'upload fail'));
        },
      });
    });

  return Promise.all(filePaths.map((filePath) => uploadMulti(filePath)));
};
