type WxPrivacySettingResult = {
  needAuthorization?: boolean;
  privacyContractName?: string;
};

const getWx = (): any => (globalThis as any)?.wx;

export const canUseWeixinPrivacyContract = () => {
  const wxAny = getWx();
  return !!(wxAny && typeof wxAny.getPrivacySetting === 'function');
};

export const openWeixinPrivacyContract = () =>
  new Promise<void>((resolve, reject) => {
    const wxAny = getWx();
    if (!wxAny || typeof wxAny.openPrivacyContract !== 'function') {
      reject(new Error('openPrivacyContract not supported'));
      return;
    }
    wxAny.openPrivacyContract({
      success: () => resolve(),
      fail: (err: any) => reject(err),
    });
  });

export const getWeixinPrivacySetting = () =>
  new Promise<WxPrivacySettingResult>((resolve) => {
    const wxAny = getWx();
    if (!wxAny || typeof wxAny.getPrivacySetting !== 'function') {
      resolve({ needAuthorization: false });
      return;
    }
    wxAny.getPrivacySetting({
      success: (res: WxPrivacySettingResult) => resolve(res || {}),
      fail: () => resolve({ needAuthorization: false }),
    });
  });

export const ensureWeixinPrivacyAuthorized = async (options?: {
  title?: string;
  content?: string;
  confirmText?: string;
  cancelText?: string;
}) => {
  const setting = await getWeixinPrivacySetting();
  if (!setting.needAuthorization) return;

  const title = options?.title || '隐私保护提示';
  const content =
    options?.content ||
    '为向你提供相关功能，需要你阅读并同意《隐私保护指引》。';

  const shouldProceed = await new Promise<boolean>((resolve) => {
    uni.showModal({
      title,
      content,
      confirmText: options?.confirmText || '去同意',
      cancelText: options?.cancelText || '暂不',
      success(res) {
        resolve(!!res.confirm);
      },
      fail() {
        resolve(false);
      },
    });
  });

  if (!shouldProceed) {
    throw new Error('privacy authorization denied');
  }

  try {
    await openWeixinPrivacyContract();
  } catch (error) {
    uni.showToast({
      title: '暂时无法打开隐私指引，请稍后重试',
      icon: 'none',
    });
    throw error;
  }
};

