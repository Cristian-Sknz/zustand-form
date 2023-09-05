import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'React Hook Form',
  description: 'Formulário feito com o React Hook Form',
}

export default function RootLayout({ children }: React.PropsWithChildren) {
  return children;
}