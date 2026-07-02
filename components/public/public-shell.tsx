import { PublicFloatingActions } from "@/components/public/public-floating-actions";
import { PublicFooter } from "@/components/public/public-footer";
import { PublicHeader } from "@/components/public/public-header";
import { PublicSiteProvider } from "@/components/public/public-site-context";
import { PublicThemeStyles } from "@/components/public/public-theme-styles";
import type { PublicSiteShell } from "@/lib/api/public-site-shell";
import {
  buildPublicFooterLinks,
  buildPublicNavLinks,
} from "@/lib/public/navigation";
import { isManagerProfilePubliclyAvailable } from "@/lib/public/manager-content";

type PublicShellProps = {
  shell: PublicSiteShell;
  children: React.ReactNode;
};

export function PublicShell({ shell, children }: PublicShellProps) {
  const navOptions = {
    ...shell.featureFlags,
    managerProfileVisible: isManagerProfilePubliclyAvailable(
      shell.managerProfile,
      shell.locale,
    ),
  };
  const navLinks = buildPublicNavLinks(shell.locale, navOptions);
  const footerLinks = buildPublicFooterLinks(shell.locale, navOptions);

  return (
    <div
      className="public-site flex min-h-screen flex-col bg-background text-foreground"
      dir={shell.dir}
      lang={shell.locale}
    >
      <PublicThemeStyles themeColors={shell.themeColors} />
      <PublicHeader shell={shell} navLinks={navLinks} />
      <PublicSiteProvider shell={shell}>
        <main className="flex-1">{children}</main>
      </PublicSiteProvider>
      <PublicFooter shell={shell} footerLinks={footerLinks} />
      <PublicFloatingActions shell={shell} />
    </div>
  );
}
