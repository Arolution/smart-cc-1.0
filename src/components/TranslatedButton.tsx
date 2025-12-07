import React from "react";
import { useTranslate } from "../hooks/useTranslate";
import type { TranslationKey } from "../i18n/translations";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  translationKey?: TranslationKey;
  // falls children ein Key ist, wird auch dieser als key genutzt
};

export default function TranslatedButton({ translationKey, children, ...rest }: Props) {
  const { t } = useTranslate();

  // Wenn ein explicit key gegeben wurde, nutze ihn.
  // Ansonsten, wenn children ein string ist, versuche diesen als key.
  const label =
    translationKey ??
    (typeof children === "string" ? (children as unknown as TranslationKey) : undefined);

  const content = label ? t(label) : children;

  return (
    <button {...rest}>
      {content}
    </button>
  );
}