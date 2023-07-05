/**
 * A better "Partial" type that makes all properties optional, including nested ones.
 * @see https://grrr.tech/posts/2021/typescript-partial/
 */
type Subset<K> = {
  [attr in keyof K]?: K[attr] extends object
    ? Subset<K[attr]>
    : K[attr] extends object | null
      ? Subset<K[attr]> | null
      : K[attr] extends object | null | undefined
        ? Subset<K[attr]> | null | undefined
        : K[attr];
};
