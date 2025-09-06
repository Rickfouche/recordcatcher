export default function Home() {
  return (
    <main className="max-w-xl mx-auto p-6 space-y-4">
      <h1 className="text-3xl font-bold">RecordCatcher — minimal OK ✅</h1>
      <p>Home is rendering. Try:</p>
      <p>
        <a className="underline mr-3" href="/login">/login</a>
        <a className="underline mr-3" href="/catch">/catch</a>
        <a className="underline" href="/vault">/vault</a>
      </p>
    </main>
  );
}
