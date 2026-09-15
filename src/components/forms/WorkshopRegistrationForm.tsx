import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import toast, { Toaster } from "react-hot-toast";
import type { UIStrings } from "@/i18n/ui";
import { HONEYPOT_FIELD, submitForm } from "./submit";
import "@styles/forms.css";

interface WorkshopRegistrationFormProps {
  /** Title of the workshop the registration is for. */
  workshop: string;
  /** Locale the visitor registered in, forwarded with the payload. */
  locale: string;
  /** Where to post; unset means demo mode (see docs/forms.md). */
  endpoint?: string;
  /** UI strings for the current locale, passed from the Astro parent so the island stays small. */
  labels: UIStrings["workshop"];
}

/** Workshop interest registration. Delivery is handled by `submit.ts`. */
export default function WorkshopRegistrationForm({
  workshop,
  locale,
  endpoint,
  labels,
}: WorkshopRegistrationFormProps) {
  const schema = z.object({
    name: z.string().min(2, { message: labels.nameTooShort }),
    email: z.email({ message: labels.invalidEmail }),
    preferredDate: z.string().min(1, { message: labels.dateRequired }),
    [HONEYPOT_FIELD]: z.string().optional(),
  });
  type Inputs = z.infer<typeof schema>;

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
      await submitForm(endpoint, { ...data, workshop, locale });
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
      className="registration-form"
      onSubmit={handleSubmit(onSubmit)}
      noValidate
    >
      <div>
        <label htmlFor="registration-name">{labels.fullName}</label>
        <input
          id="registration-name"
          type="text"
          autoComplete="name"
          placeholder={labels.fullNamePlaceholder}
          disabled={loading}
          {...register("name")}
        />
        {errors.name && <p className="form-error">{errors.name.message}</p>}
      </div>

      <div>
        <label htmlFor="registration-email">{labels.email}</label>
        <input
          id="registration-email"
          type="email"
          autoComplete="email"
          placeholder={labels.emailPlaceholder}
          disabled={loading}
          {...register("email")}
        />
        {errors.email && <p className="form-error">{errors.email.message}</p>}
      </div>

      <div>
        <label htmlFor="registration-date">{labels.preferredDate}</label>
        <input
          id="registration-date"
          type="date"
          disabled={loading}
          onClick={(event) => event.currentTarget.showPicker?.()}
          {...register("preferredDate")}
        />
        {errors.preferredDate && (
          <p className="form-error">{errors.preferredDate.message}</p>
        )}
      </div>

      <input
        type="text"
        className="form-honeypot"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        {...register(HONEYPOT_FIELD)}
      />

      <button type="submit" className="button-outline" disabled={loading}>
        <span>{loading ? labels.submitting : labels.submit}</span>
      </button>
      <Toaster position="bottom-center" />
    </form>
  );
}
