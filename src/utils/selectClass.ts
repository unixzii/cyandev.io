export function selectClass(
  selectors: Record<string, boolean | undefined>,
  extraClassName?: string
): string {
  let className = "";
  for (const key in selectors) {
    if (selectors[key]) {
      className += `${key} `;
    }
  }
  if (extraClassName) {
    className += extraClassName;
    return className;
  }
  return className.trimEnd();
}
