import { VFC } from "react";
import { trpc } from "./util/trpc";

export type UserDetailsProps = {
  userId: string;
};

export const UserDetails: VFC<UserDetailsProps> = ({ userId }) => {
  const userDetails = trpc.useQuery(["user.byId", { userId }]);

  if (!userDetails.data) {
    return null;
  }

  return (
    <div>
      {userDetails.data.name} - {userDetails.data.id}
    </div>
  );
};
