import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useLocation } from 'react-router-dom';
import '@/i18n';

vi.stubEnv('VITE_SUPABASE_URL', 'https://project.supabase.co');
vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'anon-key');

const { getSession } = vi.hoisted(() => ({ getSession: vi.fn() }));

// Stand-in for the Supabase client so tests never hit the network or depend on
// env-injected credentials. Only the auth surface used by the pages is provided.
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getSession,
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signOut: async () => ({ error: null }),
    },
  },
  isSupabaseConfigured: () => true,
  functionsUrl: (path: string) => `https://project.supabase.co/functions/v1/${path}`,
}));

import Pricing from '@/pages/Pricing';
import RegisterApplication from '@/pages/RegisterApplication';
import Login from '@/pages/Login';
import i18n from '@/i18n';
import { CurrencyProvider } from '@/hooks/useCurrency';
import { buildLoginRedirect, buildPostLoginDestination, resolveLoginRedirect, sanitizeRedirectPath } from '@/lib/authRedirect';
import { planKeyFromParam, resolvePlanInfo } from '@/lib/planKeys';

const Locations = () => {
  const location = useLocation();
  return <div data-testid="location">{`${location.pathname}${location.search}`}</div>;
};

const renderAt = (path: string, ui: React.ReactNode) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <CurrencyProvider>
        {ui}
        <Locations />
      </CurrencyProvider>
    </MemoryRouter>,
  );

const currentLocation = () => screen.getByTestId('location').textContent ?? '';

const mockSession = (authenticated: boolean) =>
  getSession.mockResolvedValue({
    data: {
      session: authenticated
        ? { access_token: 'test-token', user: { id: 'user-1', email: 'investor@example.com' } }
        : null,
    },
  });

// Every network call in the app flows through fetch. The CTA path must never
// reach the Edge Functions, so the mock doubles as the assertion surface.
const fetchMock = vi.fn((_input: RequestInfo | URL, _init?: RequestInit) =>
  Promise.resolve({ ok: true, status: 200, json: async () => ({}) }),
);

const fetchedUrls = () => fetchMock.mock.calls.map(([url]) => String(url));

beforeEach(() => {
  getSession.mockReset();
  fetchMock.mockClear();
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('plan CTA authentication gate', () => {
  it('sends an unauthenticated visitor to /login with plan + destination preserved', async () => {
    mockSession(false);
    renderAt('/pricing', <Pricing />);

    const buttons = await screen.findAllByRole('button', { name: /SECURE THIS PLAN/i });
    await waitFor(() => expect(buttons[0]).toBeEnabled());
    await userEvent.click(buttons[0]);

    await waitFor(() =>
      expect(currentLocation()).toBe('/login?redirect=%2Fregister-application&plan=starter'),
    );
  });

  it('never calls stripe-checkout for an unauthenticated visitor', async () => {
    mockSession(false);
    renderAt('/pricing', <Pricing />);

    const buttons = await screen.findAllByRole('button', { name: /SECURE THIS PLAN/i });
    await waitFor(() => expect(buttons[0]).toBeEnabled());
    await userEvent.click(buttons[1]);

    await waitFor(() => expect(currentLocation()).toContain('/login?'));
    expect(fetchedUrls().some((url) => url.includes('stripe-checkout'))).toBe(false);
  });

  it('lets an authenticated visitor through to the application form with the plan', async () => {
    mockSession(true);
    renderAt('/pricing', <Pricing />);

    const buttons = await screen.findAllByRole('button', { name: /SECURE THIS PLAN/i });
    await waitFor(() => expect(buttons[1]).toBeEnabled());
    await userEvent.click(buttons[1]);

    await waitFor(() => expect(currentLocation()).toBe('/register-application?plan=professional'));
    expect(fetchedUrls().some((url) => url.includes('stripe-checkout'))).toBe(false);
  });

  it('restores the selected plan after login', async () => {
    mockSession(true);
    renderAt('/login?redirect=/register-application&plan=starter', <Login />);

    await waitFor(() => expect(currentLocation()).toBe('/register-application?plan=starter'));
  });

  it('redirects a direct application visit by an unauthenticated visitor to login', async () => {
    mockSession(false);
    renderAt('/register-application?plan=business', <RegisterApplication />);

    await waitFor(() =>
      expect(currentLocation()).toBe('/login?redirect=%2Fregister-application&plan=business'),
    );
  });

  it('never renders the application form to an unauthenticated visitor', async () => {
    mockSession(false);
    renderAt('/register-application?plan=enterprise', <RegisterApplication />);

    await waitFor(() => expect(currentLocation()).toContain('/login?'));
    expect(screen.queryByText(/Submit Application/i)).toBeNull();
  });
});

describe('plan key and redirect validation', () => {
  it('accepts only the four known plan keys', () => {
    expect(planKeyFromParam('starter')).toBe('starter');
    expect(planKeyFromParam('Professional')).toBe('professional');
    expect(planKeyFromParam(' business ')).toBe('business');
    expect(planKeyFromParam('enterprise')).toBe('enterprise');
    expect(planKeyFromParam('premium')).toBeNull();
    expect(planKeyFromParam('<script>')).toBeNull();
    expect(planKeyFromParam('')).toBeNull();
  });

  it('falls back to null for an unknown plan payload', () => {
    expect(resolvePlanInfo({ id: 'platinum' })).toBeNull();
    expect(resolvePlanInfo({ id: 'starter', priceUSD: 1 })?.priceUSD).toBe(200);
  });

  it('rejects external redirect targets', () => {
    expect(sanitizeRedirectPath('https://evil.example')).toBeNull();
    expect(sanitizeRedirectPath('//evil.example')).toBeNull();
    expect(sanitizeRedirectPath('/\\evil.example')).toBeNull();
    expect(sanitizeRedirectPath('/register-application')).toBe('/register-application');
    expect(sanitizeRedirectPath('/login')).toBeNull();
  });

  it('falls back to the dashboard for unknown plans and unsafe redirects', () => {
    expect(resolveLoginRedirect('?redirect=https://evil.example').target).toBe('/dashboard');
    expect(resolveLoginRedirect('?redirect=https://evil.example&plan=starter').target).toBe(
      '/register-application',
    );
    expect(resolveLoginRedirect('?plan=starter').target).toBe('/register-application');
    expect(resolveLoginRedirect('?plan=starter').plan).toBe('starter');
    expect(resolveLoginRedirect('?plan=platinum').plan).toBeNull();
    expect(buildLoginRedirect('/register-application', null)).toBe('/login?redirect=%2Fregister-application');
    expect(buildPostLoginDestination('/register-application', 'business')).toBe(
      '/register-application?plan=business',
    );
  });
});

describe('translations and RTL', () => {
  const LOCALES = ['en', 'pt', 'it', 'es', 'fr', 'de', 'ru', 'zh', 'ja', 'ar', 'he'] as const;
  const PLAN_KEYS = ['starter', 'professional', 'business', 'enterprise'] as const;

  it('resolves loginRequired and all four plan names in every locale', () => {
    for (const lng of LOCALES) {
      const required = i18n.getFixedT(lng)('auth.loginRequired');
      expect(required, `${lng} auth.loginRequired`).toBeTruthy();
      expect(required, `${lng} auth.loginRequired should not echo the key`).not.toBe('auth.loginRequired');
      for (const key of PLAN_KEYS) {
        const name = i18n.getFixedT(lng)(`pricing.planKeys.${key}`);
        expect(name, `${lng} pricing.planKeys.${key}`).toBeTruthy();
        expect(name, `${lng} pricing.planKeys.${key} should not echo the key`).not.toBe(
          `pricing.planKeys.${key}`,
        );
      }
    }
  });

  it('keeps RTL direction for Arabic and Hebrew and LTR elsewhere', async () => {
    for (const lng of ['ar', 'he'] as const) {
      await i18n.changeLanguage(lng);
      expect(document.documentElement.dir).toBe('rtl');
      expect(document.documentElement.lang).toBe(lng);
    }
    await i18n.changeLanguage('en');
    expect(document.documentElement.dir).toBe('ltr');
  });
});