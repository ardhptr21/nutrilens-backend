declare namespace Express {
	export interface Request {
		user: User;
		validated: {
			body: any;
			query: any;
			params: any;
		};
	}
}
