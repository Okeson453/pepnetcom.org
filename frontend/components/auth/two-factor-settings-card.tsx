"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, ShieldCheck, ShieldOff, Copy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { FormField } from "@/components/forms/form-field";
import { useToast } from "@/components/feedback/toast";
import {
  useCurrentUser,
  useStartTwoFactorSetup,
  useConfirmTwoFactorSetup,
  useDisableTwoFactor,
} from "@/features/auth";

type Step = "idle" | "setup" | "backup-codes";

/**
 * Shared across client/writer/admin settings pages. Flow:
 *   1. "Enable" → auth.twoFactor.setup → shows the secret + otpauth:// URI
 *      (as copyable text rather than a rendered QR image, to avoid pulling
 *      in a QR-generation dependency for one settings card).
 *   2. User adds it to their authenticator app, types the 6-digit code back
 *      in → auth.twoFactor.confirmSetup actually turns 2FA on and returns
 *      one-time backup codes (shown once, never retrievable again).
 *   3. "Disable" requires re-entering the password, same reasoning as
 *      ChangePasswordCard requiring the current one.
 */
export function TwoFactorSettingsCard() {
  const { addToast } = useToast();
  const { data: currentUser, refetch } = useCurrentUser();
  const [step, setStep] = useState<Step>("idle");
  const [confirmCode, setConfirmCode] = useState("");
  const [disablePassword, setDisablePassword] = useState("");
  const [showDisableForm, setShowDisableForm] = useState(false);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);

  const startSetup = useStartTwoFactorSetup();
  const confirmSetup = useConfirmTwoFactorSetup({
    onSuccess: (data) => {
      setBackupCodes(data.backupCodes);
      setStep("backup-codes");
      refetch();
    },
    onError: (err: any) => addToast(err?.message ?? "Invalid code", "error"),
  });
  const disable = useDisableTwoFactor({
    onSuccess: () => {
      addToast("Two-factor authentication disabled", "success");
      setShowDisableForm(false);
      setDisablePassword("");
      refetch();
    },
    onError: (err: any) => addToast(err?.message ?? "Incorrect password", "error"),
  });

  const isEnabled = currentUser?.twoFactorEnabled ?? false;

  async function handleStartSetup() {
    try {
      await startSetup.mutateAsync(undefined, {
        onSuccess: () => setStep("setup"),
      });
    } catch (err: any) {
      addToast(err?.message ?? "Couldn't start 2FA setup", "error");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isEnabled ? <ShieldCheck className="h-4 w-4 text-teal" /> : <ShieldOff className="h-4 w-4 opacity-50" />}
          Two-Factor Authentication
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {step === "idle" && !showDisableForm && (
          <>
            <p className="text-sm opacity-70">
              {isEnabled
                ? "Two-factor authentication is on. You'll need a code from your authenticator app (or a backup code) every time you sign in."
                : "Add an extra layer of security — once enabled, sign-in requires a code from an authenticator app in addition to your password."}
            </p>
            {isEnabled ? (
              <Button variant="secondary" onClick={() => setShowDisableForm(true)}>Disable 2FA</Button>
            ) : (
              <Button onClick={handleStartSetup} disabled={startSetup.isPending}>
                {startSetup.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Enable 2FA"}
              </Button>
            )}
          </>
        )}

        {showDisableForm && (
          <div className="space-y-3 max-w-sm">
            <FormField label="Confirm your password">
              <PasswordInput value={disablePassword} onChange={(e) => setDisablePassword(e.target.value)} />
            </FormField>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                disabled={!disablePassword || disable.isPending}
                onClick={() => disable.mutate({ password: disablePassword })}
              >
                {disable.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm disable"}
              </Button>
              <Button variant="ghost" onClick={() => { setShowDisableForm(false); setDisablePassword(""); }}>Cancel</Button>
            </div>
          </div>
        )}

        {step === "setup" && startSetup.data && (
          <div className="space-y-3 max-w-sm">
            <p className="text-sm opacity-70">
              Add this key to your authenticator app (Google Authenticator, 1Password, Authy, etc.), then enter the 6-digit code it generates.
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 rounded bg-graphite/5 px-3 py-2 text-xs break-all font-mono">{startSetup.data.secret}</code>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(startSetup.data!.secret);
                  addToast("Secret copied", "success");
                }}
              >
                <Copy className="h-3.5 w-3.5" />
              </Button>
            </div>
            <FormField label="6-digit code">
              <Input
                autoFocus
                value={confirmCode}
                onChange={(e) => setConfirmCode(e.target.value)}
                placeholder="123456"
              />
            </FormField>
            <div className="flex gap-2">
              <Button
                disabled={confirmCode.length < 6 || confirmSetup.isPending}
                onClick={() => confirmSetup.mutate({ code: confirmCode })}
              >
                {confirmSetup.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm & enable"}
              </Button>
              <Button variant="ghost" onClick={() => { setStep("idle"); setConfirmCode(""); }}>Cancel</Button>
            </div>
          </div>
        )}

        {step === "backup-codes" && (
          <div className="space-y-3 max-w-sm">
            <p className="flex items-center gap-2 text-sm text-teal">
              <CheckCircle2 className="h-4 w-4" /> Two-factor authentication is now on.
            </p>
            <p className="text-sm opacity-70">
              Save these backup codes somewhere safe — each one can be used once instead of your authenticator code if you lose access to it. They won't be shown again.
            </p>
            <div className="grid grid-cols-2 gap-2 rounded bg-graphite/5 p-3 font-mono text-xs">
              {backupCodes.map((code) => (
                <span key={code}>{code}</span>
              ))}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(backupCodes.join("\n"));
                addToast("Backup codes copied", "success");
              }}
            >
              <Copy className="h-3.5 w-3.5 mr-1.5" /> Copy all
            </Button>
            <div>
              <Button onClick={() => { setStep("idle"); setConfirmCode(""); setBackupCodes([]); }}>Done</Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
