import { Injectable } from "@angular/core";
import { generateClient } from "aws-amplify/api";
import { Schema } from "../../../amplify/data/resource";

const client = generateClient<Schema>();
export type User = Schema['User']['type'];

@Injectable({
    providedIn: 'root'
})

export class UserService {

    async getUsers() {
        const { data, errors } = await client.models.User.list();
        if (errors) {
            console.error('Error fetching users:', errors);
        }
        return data;
    }

    async getUser(id: string) {
        const { data, errors } = await client.models.User.get({ id });
        if (errors) {
            console.error('Error fetching user:', errors);
        }
        return data;
    }

    async createUser(user: { id: string, email: string, name: string, role: string, branch: string, shopName: string, phone: string }) {
        const { data, errors } = await client.models.User.create(user);
        if (errors) {
            console.error('Error creating user:', errors);
        }
        return data;
    }

    async updateUser(user: { id: string, email: string, name: string, role: string, branch: string, shopName: string, phone: string }) {
        const { data, errors } = await client.models.User.update(user);
        if (errors) {
            console.error('Error updating user:', errors);
        }
        return data;
    }

    async deleteUser(id: string) {
        const { data, errors } = await client.models.User.delete({ id });
        if (errors) {
            console.error('Error deleting user:', errors);
        }
        return data;
    }


}