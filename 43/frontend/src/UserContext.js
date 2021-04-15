import { createContext } from "react";

/** 
 * Context for accessing user credentials.
 * 
 * @type {React.Context<{
 *      currentUser: {
 *          username: string,
 *          isAdmin: boolean,
 *          firstName?: string,
 *          lastName?: string,
 *          email?: string
 *      },
 *      appliedJobs: number[],
 *      logIn: ({ username: string, password: string }) => Promise<void>,
 *      logOut: () => void,
 *      signUp: ({
 *          username: string,
 *          password: string,
 *          firstName: string,
 *          lastName: string,
 *          email: string
 *      }) => Promise<void>,
 *      applyForJob: (jobId: number) => Promise<void>,
 *      updateUserDetails: (details: {
 *          password: string,
 *          firstName?: string,
 *          lastName?: string,
 *          email?: string
 *      }) => Promise<void>
 * }>}
 */
const UserContext = createContext();

export default UserContext;
