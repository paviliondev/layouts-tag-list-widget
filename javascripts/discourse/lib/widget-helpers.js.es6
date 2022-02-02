function isHidden(item, setting) {
  const hiddenItem = setting.split('|');

  if (hiddenItem.includes(item)) {
    return true;
  }
}

export { isHidden };
