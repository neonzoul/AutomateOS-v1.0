export default function Home() {
  return (
    <main className="p-6">
      <h1 className="text-xl font-semibold">AutomateOS Creator Studio</h1>
      <p className="mt-2 text-gray-600">Open the Builder to start.</p>
      <a
        className="inline-block mt-4 px-4 py-2 rounded bg-blue-600 text-white"
        href="/builder"
      >
        Open Builder
      </a>
    </main>
  );
}
