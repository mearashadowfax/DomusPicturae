import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import toast, { Toaster } from "react-hot-toast";
import type { UIStrings } from "@/i18n/ui";
import { HONEYPOT_FIELD, submitForm } from "./submit";
import "@styles/forms.css";

const schema = z.object({
  email: z.email(),
  [HONEYPOT_FIELD]: z.string().optional(),
});
type Inputs = z.infer<typeof schema>;

interface NewsletterFormProps {
  /** Where to post; unset means demo mode (see docs/forms.md). */
  endpoint?: string;
  /** UI strings for the current locale, passed from the Astro parent so the island stays small. */
  labels: UIStrings["newsletter"];
}

/** Newsletter sign-up. Delivery is handled by `submit.ts`. */
export default function NewsletterForm({
  endpoint,
  labels,
}: NewsletterFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Inputs>({ resolver: zodResolver(schema) });
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: Inputs) => {
    setLoading(true);
    try {
      await submitForm(endpoint, data);
      toast.success(labels.success);
      reset();
    } catch (error) {
      console.error(error);
      toast.error(labels.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      className="newsletter-form"
      onSubmit={handleSubmit(onSubmit)}
      noValidate
    >
      <h2 className="newsletter-form__title">{labels.heading}</h2>
      <div className="newsletter-form__row">
        <input
          id="newsletter-email"
          type="email"
          autoComplete="email"
          aria-label={labels.placeholder}
          placeholder={labels.placeholder}
          disabled={loading}
          {...register("email")}
        />
        <button type="submit" className="button-outline" disabled={loading}>
          <span>{loading ? labels.loading : labels.button}</span>
        </button>
      </div>
      <input
        type="text"
        className="form-honeypot"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        {...register(HONEYPOT_FIELD)}
      />
      {errors.email && <p className="form-error">{labels.invalidEmail}</p>}
      <p className="newsletter-form__terms">{labels.terms}</p>
      <Toaster position="bottom-center" />
    </form>
  );
}
