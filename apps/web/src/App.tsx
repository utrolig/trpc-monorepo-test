import { trpc } from "./util/trpc";
import { isUnauthorizedError } from "./util/UnauthorizedError";

const logoutUrl = `http://localhost:4000/api/auth/logout?from=${encodeURI(
  window.location.href
)}`;

const loginUrl = `http://localhost:4000/api/auth/discord/login?from=${encodeURI(
  window.location.href
)}`;

function App() {
  const fetchedUserId = trpc.useQuery(["user.self"], { retry: false });

  if (isUnauthorizedError(fetchedUserId.error)) {
    return (
      <div>
        <p>You have to login dude.</p>
        <a href={loginUrl}>Login NOW!</a>
      </div>
    );
  }

  return (
    <div className="App">
      <p>You're logged in dude.</p>
      <a href={logoutUrl}>Logout NOW!</a>
    </div>
  );
}

export default App;
