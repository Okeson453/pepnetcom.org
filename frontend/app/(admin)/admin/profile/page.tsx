"use client";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/forms/form-field";
import { ChangePasswordCard } from "@/components/auth/change-password-card";
import { TwoFactorSettingsCard } from "@/components/auth/two-factor-settings-card";
import { useUpdateProfile } from "@/features/users";
import { useCurrentUser } from "@/features/auth";

// Previously the UserMenu's Profile link for admins just pointed back at
// /admin (no dedicated page existed at all). Same real userUpdateSchema
// fields as the client/writer profile pages.
interface ProfileForm {
  firstName: string;
  lastName: string;
  phone: string;
}

export default function AdminProfilePage() {
  const { data: session, update: updateSession } = useSession();
  const { data: currentUser } = useCurrentUser();
  const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm<ProfileForm>();
  const mutation = useUpdateProfile();

  useEffect(() => {
    if (currentUser) {
      reset({
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
        phone: currentUser.phone ?? "",
      });
    }
  }, [currentUser, reset]);

  const onSubmit = (d: ProfileForm) => {
    mutation.mutate(
      { firstName: d.firstName, lastName: d.lastName, phone: d.phone || undefined },
      { onSuccess: () => updateSession({ name: `${d.firstName} ${d.lastName}`.trim() }) }
    );
  };

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold">Profile</h1>
      <Card>
        <CardHeader><CardTitle>Personal Information</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-sm">
            <div className="grid grid-cols-2 gap-3">
              <FormField label="First Name" required error={errors.firstName?.message}>
                <Input {...register("firstName", { required: "Required" })} />
              </FormField>
              <FormField label="Last Name" required error={errors.lastName?.message}>
                <Input {...register("lastName", { required: "Required" })} />
              </FormField>
            </div>
            <FormField label="Phone">
              <Input type="tel" {...register("phone")} />
            </FormField>
            <FormField label="Email">
              <Input value={session?.user?.email ?? ""} disabled />
            </FormField>
            <Button type="submit" disabled={mutation.isPending || !isDirty}>
              {mutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </CardContent>
      </Card>
      <ChangePasswordCard />
      <TwoFactorSettingsCard />
    </div>
  );
}
