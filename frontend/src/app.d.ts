// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces

declare global {

  interface User {
    name: string;
    email: string;
    image: string;
    token: string;
  }
  
  namespace App {
    // interface Error {}
    interface Locals {
      user: User | null;
    }
    // interface PageData {}
    // interface PageState {}
    // interface Platform {}
  }
}

export {};
