function getDisplayName(WrappedComponent) {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}

export default function createHOCFactory(creator, name) {
  return function (WrappedComponent) {
    const Wrapped = creator(WrappedComponent);
    Wrapped.displayName = `${name}(${getDisplayName(WrappedComponent)})`;
    return Wrapped;
  }
}
