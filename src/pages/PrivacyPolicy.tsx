import LegalDocumentLayout from '../components/LegalDocumentLayout';
import { PRIVACY_POLICY_VERSION, privacyPolicySections } from '../lib/legalContent';

export default function PrivacyPolicy() {
  return (
    <LegalDocumentLayout
      title="Política de Privacidade"
      subtitle="Como a Tessy trata seus dados pessoais na plataforma."
      version={PRIVACY_POLICY_VERSION}
      sections={privacyPolicySections}
    />
  );
}
