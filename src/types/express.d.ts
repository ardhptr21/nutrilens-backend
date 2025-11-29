import type { PublicUser } from "@/api/user/userModel";

declare global {
	namespace Express {
		interface Request {
			user: PublicUser;
			validated: {
				body: any;
				query: any;
				params: any;
			};
		}
	}
}
