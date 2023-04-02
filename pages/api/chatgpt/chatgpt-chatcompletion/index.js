import { createChatCompletionPost } from "@/backend/controllers/chatgptControllers";

export default async function handler(req, res) {
  // type of request
  const { method } = req;
  switch (method) {
    case "POST":
      // POST /api/users -> Post/Create a user
      await createChatCompletionPost(req, res);
      break;
    default:
      res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
      res.status(405).end(`Method ${method} Not Allowd`);
      break;
  }
}
