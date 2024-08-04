

interface IUser {
    _id?: string;
    name: string;
    email: string;
    password: string;
    secret?: string;
  }
  
  class User {
    private data: IUser;
  
    constructor(data: IUser) {
      this.data = data;
    }
  
    get info(): IUser {
      return this.data;
    }
  
    update(details: Partial<IUser>) {
      this.data = { ...this.data, ...details };
    }
  }
  
  export { User, IUser };
