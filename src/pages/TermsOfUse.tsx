import LegalDocumentLayout from '../components/LegalDocumentLayout';
import { termsOfUseSections } from '../lib/legalContent';

export default function TermsOfUse() {
  return (
    <LegalDocumentLayout
      title="Termos de Uso"
      subtitle="Regras para uso da plataforma Tessy.app."
      sections={termsOfUseSections}
    />
  );
}
