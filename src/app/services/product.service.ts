import { Injectable } from "@angular/core";
import { generateClient } from "aws-amplify/api";
import { Schema } from "../../../amplify/data/resource";

const client = generateClient<Schema>();
export type Product = Schema['Product']['type'];

@Injectable({
    providedIn: 'root'
})

export class ProductService {

    async getProducts(): Promise<Product[]> {
        const { data, errors } = await client.models.Product.list();
        if (errors) {
            console.error('Error fetching products:', errors);
        }
        return data;
    }

    async getProduct(id: string) {
        const { data, errors } = await client.models.Product.get({ id });
        if (errors) {
            console.error('Error fetching product:', errors);
        }
        return data;
    }

    async createProduct(product: { name: string, price: number, stockQuantity: number, isAvailable: boolean, imageUrl: string, description: string }) {
        const { data, errors } = await client.models.Product.create(product);
        if (errors) {
            console.error('Error creating product:', errors);
        }
        return data;
    }

    async updateProduct(product: { id: string, name: string, price: number, stockQuantity: number, isAvailable: boolean, imageUrl: string, description: string }) {
        const { data, errors } = await client.models.Product.update(product);
        if (errors) {
            console.error('Error updating product:', errors);
        }
        return data;
    }

    async deleteProduct(id: string) {
        const { data, errors } = await client.models.Product.delete({ id });
        if (errors) {
            console.error('Error deleting product:', errors);
        }
        return data;
    }
}