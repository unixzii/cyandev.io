import { ComponentProps, ComponentType, ExoticComponent } from "react";

export type MethodKeys<T> = {
  [K in keyof T]: T[K] extends (...args: any) => any ? K : never;
}[keyof T];

export type WrappedComponent =
  | keyof JSX.IntrinsicElements
  | ComponentType
  | ExoticComponent<any>;
type WrappedComponentSelectorProps<Comp extends WrappedComponent> = {
  elementType?: Comp;
};
export type WrapperComponentProps<
  Comp extends WrappedComponent,
  P
> = WrappedComponentSelectorProps<Comp> & Omit<ComponentProps<Comp>, "ref"> & P;
