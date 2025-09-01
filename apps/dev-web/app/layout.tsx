export const metadata = {
  title: 'Creator Studio',
  description: 'AutomateOS Creator Studio – Hello React Flow',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
