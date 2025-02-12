import { useEffect, useState } from "react";
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import { useAuthenticator } from "@aws-amplify/ui-react";

const client = generateClient<Schema>();

function App() {
  const [todos, setTodos] = useState<Array<Schema["Todo"]["type"]>>([]);
  const { user, signOut } = useAuthenticator(); // Get user info

  useEffect(() => {
    if (!user) return;

    // Filter todos by the user's ID
    const subscription = client.models.Todo.observeQuery({
      filter: { owner: { eq: user.username } }, // Assuming 'owner' stores the user ID
    }).subscribe({
      next: (data) => setTodos([...data.items]),
    });

    return () => subscription.unsubscribe(); // Clean up subscription
  }, [user]);

  function createTodo() {
    const content = window.prompt("Todo content");
    if (content) {
      client.models.Todo.create({
        content,
        owner: user.username, // Ensure owner field is set
      }).then(() => {
        console.log("Todo created successfully");
      }).catch((error) => {
        console.error("Error creating todo:", error);
      });
    }
  }

  function deleteTodo(id: string) {
    client.models.Todo.delete({ id });
  }

  return (
    <main>
      <h1>Welcome {user?.signInDetails?.loginId}</h1>
      <p>Manage Your ToDo's</p>
      <button onClick={createTodo}>+ new</button>
      <ul>
        {todos.map((todo) => (
          <li onClick={() => deleteTodo(todo.id)} key={todo.id}>
            {todo.content}
          </li>
        ))}
      </ul>
      <div>
        🥳 App successfully hosted. Try creating a new todo.
        <br />
        <a href="https://docs.amplify.aws/react/start/quickstart/#make-frontend-updates">
          Review next step of this tutorial.
        </a>
      </div>
      <button onClick={signOut}>Sign out</button>
    </main>
  );
}

export default App;
