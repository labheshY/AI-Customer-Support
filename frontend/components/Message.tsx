export default function Message({ msg }: any) {
  return (
    <div
      className={`flex ${
        msg.role === "user" ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`px-4 py-2 rounded-2xl max-w-md ${
          msg.role === "user"
            ? "bg-violet-600"
            : "bg-white/10"
        }`}
      >
        {msg.content}
      </div>
    </div>
  );
}