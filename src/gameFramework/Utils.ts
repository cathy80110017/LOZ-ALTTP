export function overrideProperty(
  defaultSettings: { [key: string]: any },
  userSettings: { [key: string]: any }
): { [key: string]: any } {
  for (const key in defaultSettings) {
    if (!userSettings[key]) {
      userSettings[key] = defaultSettings[key];
    }
  }
  return userSettings;
}

export function findValueByKey<T extends { name: string }>(
  targetList: T[],
  key: string
): T {
  for (let i = 0, l = targetList.length; i < l; i++) {
    if (targetList[i].name === key) {
      return targetList[i];
    }
  }
  return null;
}
