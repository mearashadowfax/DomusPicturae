/**
 * Descriptors → Keystatic collections and singletons for the admin UI.
 */
import { collection, fields, singleton } from "@keystatic/core";
import { defaultLocale, locales, type Locale } from "@/i18n/config";
import type {
  CollectionDescriptor,
  Field,
  Shape,
  SingletonDescriptor,
} from "./fields";

const localeNames: Record<Locale, string> = {
  en: "English",
  fr: "Français",
  de: "Deutsch",
};

/** Column spans (out of 12) that lay the per-locale inputs side by side. */
const localeLayout =
  12 % locales.length === 0
    ? locales.map(() => 12 / locales.length)
    : undefined;

const IMAGE_ROOT = "src/assets/images";
const PUBLIC_ROOT = "/images";

type KeystaticField = ReturnType<typeof fields.text>;

function perLocale<F>(make: (locale: Locale) => F): Record<Locale, F> {
  return Object.fromEntries(locales.map((l) => [l, make(l)])) as Record<
    Locale,
    F
  >;
}

function keystaticField(field: Field): unknown {
  switch (field.kind) {
    case "slug":
      return fields.text({
        label: field.label,
        description: field.description,
        validation: {
          isRequired: true,
          pattern: {
            regex: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
            message: "Use lowercase letters, numbers and hyphens only",
          },
        },
      });
    case "name":
      return fields.slug({ name: { label: field.label } });
    case "text": {
      const make = (label: string, required: boolean) =>
        fields.text({
          label,
          multiline: field.multiline,
          description: field.localized ? undefined : field.description,
          validation: { isRequired: required },
        });
      if (!field.localized) return make(field.label, field.required);
      // Only the default locale is required; translations may be added later.
      return fields.object(
        perLocale((l) =>
          make(localeNames[l], field.required && l === defaultLocale),
        ),
        {
          label: field.label,
          description: field.description,
          layout: field.multiline ? undefined : localeLayout,
        },
      );
    }
    case "body":
      return fields.object(
        perLocale((l) =>
          fields.markdoc({ label: localeNames[l], extension: "md" }),
        ),
        { label: field.label },
      );
    case "image":
      return fields.image({
        label: field.label,
        directory: `${IMAGE_ROOT}/${field.directory}`,
        publicPath: `${PUBLIC_ROOT}/${field.directory}/`,
        validation: { isRequired: field.required },
      });
    case "relation":
      return fields.relationship({
        label: field.label,
        collection: field.collection,
        validation: { isRequired: field.required },
      });
    case "date":
      return fields.date({
        label: field.label,
        validation: { isRequired: field.required },
      });
    case "integer":
      return fields.integer({
        label: field.label,
        validation: { isRequired: field.required },
      });
    case "number":
      return fields.number({
        label: field.label,
        description: field.description,
        defaultValue: field.defaultValue,
        validation: { isRequired: field.required },
      });
    case "checkbox":
      return fields.checkbox({
        label: field.label,
        description: field.description,
        defaultValue: field.defaultValue,
      });
    case "select":
      return fields.select({
        label: field.label,
        description: field.description,
        options: [...field.options],
        defaultValue: field.defaultValue,
      });
    case "url":
      return fields.url({ label: field.label, description: field.description });
    case "object":
      return fields.object(keystaticShape(field.fields), {
        label: field.label,
        layout: field.layout,
      });
    case "array": {
      const labelField = field.of[field.itemLabel];
      return fields.array(fields.object(keystaticShape(field.of)), {
        label: field.label,
        description: field.description,
        itemLabel: (props: any) => {
          const value = props.fields[field.itemLabel];
          const text =
            labelField.kind === "text" && labelField.localized
              ? value?.fields?.[locales[0]]?.value
              : value?.value;
          return text || field.label;
        },
      });
    }
  }
}

function keystaticShape(shape: Shape): Record<string, KeystaticField> {
  return Object.fromEntries(
    Object.entries(shape).map(([key, field]) => [
      key,
      keystaticField(field) as KeystaticField,
    ]),
  );
}

export function keystaticCollection(
  name: string,
  descriptor: CollectionDescriptor,
) {
  const path =
    descriptor.layout === "directory"
      ? `src/content/${name}/*/`
      : `src/content/${name}/*`;
  return collection({
    label: descriptor.label,
    slugField: descriptor.slugField,
    path: path as `${string}/*`,
    format: { data: "json" },
    schema: keystaticShape(descriptor.fields),
  });
}

export function keystaticSingleton(
  name: string,
  descriptor: SingletonDescriptor,
) {
  return singleton({
    label: descriptor.label,
    path: `src/content/${name}/`,
    format: { data: "json" },
    schema: keystaticShape(descriptor.fields),
  });
}
