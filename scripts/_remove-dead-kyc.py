#!/usr/bin/env python3
"""Remove the now-dead in-dashboard KYC upload flow from Dashboard.tsx.

After the settings KYC tab was reduced to an info panel + link to the withdrawal
gate, the old inline upload flow (and its state) is dead code. Verification is
owned solely by WithdrawalKycGate -> the authenticated kyc-submit Edge Function.
"""
import io

PATH = "src/pages/Dashboard.tsx"


def cut(lines, start_marker, end_marker, inclusive_end=True):
    """Remove lines from the line containing start_marker through end_marker."""
    si = next(i for i, l in enumerate(lines) if start_marker in l)
    ei = next(i for i, l in enumerate(lines) if end_marker in l and i >= si)
    return lines[:si] + lines[ei + (1 if inclusive_end else 0):]


def main():
    with io.open(PATH, encoding="utf-8") as f:
        src = f.read()

    # 1. KYC state block (keep kycStatus + kycReviewReason).
    src = src.replace(
        """  const [kycStep, setKycStep] = useState<'country' | 'method' | 'document' | 'review'>('country');
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);
  const [kycDocument, setKycDocument] = useState<File | null>(null);
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
  const [methodDropdownOpen, setMethodDropdownOpen] = useState(false);
  const [submittingKyc, setSubmittingKyc] = useState(false);

  // Get current country data
  const countryData = selectedCountry ? getCountryByCode(selectedCountry) : null;
  const methodData = countryData?.methods.find(m => m.id === selectedMethod);

""",
        "",
    )

    # 2. handleKycSubmit + step helpers + can* flags.
    start = src.index("  const handleKycSubmit = async () => {")
    end_marker = "  const canSubmit = kycDocument !== null && selectedDocument !== null;\n"
    end = src.index(end_marker) + len(end_marker)
    src = src[:start] + src[end:]

    # 3. Unused imports.
    src = src.replace(
        "import { countriesData, getCountryByCode } from '@/data/kycData';\n", ""
    )
    src = src.replace(
        "import { functionsUrl, supabase, isSupabaseConfigured } from '@/integrations/supabase/client';",
        "import { supabase, isSupabaseConfigured } from '@/integrations/supabase/client';",
    )

    with io.open(PATH, "w", encoding="utf-8") as f:
        f.write(src)
    print("removed dead KYC upload flow from Dashboard.tsx")


if __name__ == "__main__":
    main()
