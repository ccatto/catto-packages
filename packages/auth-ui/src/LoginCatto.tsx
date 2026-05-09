'use client';

import { CardCatto } from '@ccatto/ui';
import { useTranslations } from 'next-intl';
import SignInEmailPassFormCatto, {
  type SignInEmailPassFormCattoProps,
} from './SignInEmailPassFormCatto';

export interface LoginCattoProps extends SignInEmailPassFormCattoProps {
  /** CardCatto variant. Defaults to 'midnightEmber'. */
  cardVariant?: string;
  /** CardCatto width. Defaults to '5xl'. */
  cardWidth?: string;
}

const LoginCatto = ({
  cardVariant = 'midnightEmber',
  cardWidth = '5xl',
  i18nNamespace = 'auth',
  ...formProps
}: LoginCattoProps) => {
  const t = useTranslations(i18nNamespace);

  return (
    <div className="mt-6 h-full">
      <CardCatto
        title={t('signIn.cardTitle')}
        // CardCatto's variant + width props are loosely typed here so consumers
        // can pass any of the package's themes without us having to track the
        // union in two places.
        variant={cardVariant as never}
        width={cardWidth as never}
        headerComponent={
          <SignInEmailPassFormCatto
            {...formProps}
            i18nNamespace={i18nNamespace}
          />
        }
      />
    </div>
  );
};

export default LoginCatto;
