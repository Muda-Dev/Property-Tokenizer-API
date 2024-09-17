import Model from "../helpers/model";
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

class Accounts extends Model {

    constructor() {
        super();
    }

    private hashPassword(password: string) {
        const hash = crypto.createHash('sha256');
        return hash.update(password).digest('hex');
    }

    async login(data: any) {
        const { email, password } = data;
        const hashPassword = this.hashPassword(password);

        try {
            // Fetch user by 
            const users = await this.selectDataQuery("company_accounts", `email = '${email}' and password='${hashPassword}'`);
            const user = users.length > 0 ? users[0] : null;

            if (!user) {
                return this.makeResponse(203, "User not found");
            }
            let user_id = user.user_id
            const jwts: any = process.env.JWT_SECRET
            const token = jwt.sign({ user_id }, jwts, {
                expiresIn: 86400 // 24 hours
            });
            const response = { ...user, jwt: token };
            return this.makeResponse(100, "Login successful", response);
        } catch (error) {
            console.error("Error in login:", error);
            return this.makeResponse(203, "Error logging in");
        }
    }


    // Create a new company account
    async addCompany(data: any) {
        try {
            const { name, email, phone, password } = data;
            const companies = await this.selectDataQuery('company_accounts', `email='${email}'`);
            if (companies.length >0 ) {
                return this.makeResponse(203, "Email already exists");
            }

            if (password.length < 7) {
                return this.makeResponse(203, "weak password");
            }

            if (email == "" || name == "") {
                return this.makeResponse(203, "Name and email required");

            }
            const hashPassword = this.hashPassword(password);

            const newCompany = { name, email, password: hashPassword, phone };

            const insertedCompany = await this.insertData('company_accounts', newCompany);
            return this.makeResponse(100, "Company added successfully", insertedCompany);
        } catch (error) {
            console.error("Error in addCompany:", error);
            return this.makeResponse(203, "Error adding company");
        }
    }

    // Fetch all companies
    async getCompanies() {
        try {
            const companies = await this.selectDataQuery('company_accounts');
            if (companies.length > 0) {
                return this.makeResponse(100, "Companies fetched successfully", companies);
            } else {
                return this.makeResponse(404, "No companies found");
            }
        } catch (error) {
            console.error("Error in getCompanies:", error);
            return this.makeResponse(203, "Error fetching companies");
        }
    }

    // Create a new service for a company
    async addService(data: any) {
        try {
            const { service_name, provider_name, country, chain, company_id, currency } = data;
            const newService = { service_name, provider_name, country, chain, company_id, currency };
            const insertedService = await this.insertData('services', newService);
            return this.makeResponse(100, "Service added successfully", insertedService);
        } catch (error) {
            console.error("Error in addService:", error);
            return this.makeResponse(203, "Error adding service");
        }
    }

    // Fetch services for a specific company
    async getServices(company_id: number) {
        try {
            const services = await this.selectDataQuery("services", `company_id = '${company_id}'`);
            if (services.length > 0) {
                return this.makeResponse(100, "Services fetched successfully", services);
            } else {
                return this.makeResponse(404, "Services not found for the given company");
            }
        } catch (error) {
            console.error("Error in getServices:", error);
            return this.makeResponse(203, "Error fetching services");
        }
    }

    // Add an accepted asset for a service
    async addAcceptedAsset(data: any) {
        try {
            const { service_id, asset_code, asset_name } = data;
            const newAsset = { service_id, asset_code, asset_name };
            const insertedAsset = await this.insertData('accepted_assets', newAsset);
            return this.makeResponse(100, "Accepted asset added successfully", insertedAsset);
        } catch (error) {
            console.error("Error in addAcceptedAsset:", error);
            return this.makeResponse(203, "Error adding accepted asset");
        }
    }

    // Fetch all accepted assets for a service
    async getAcceptedAssets(service_id: number) {
        try {
            const assets = await this.selectDataQuery("accepted_assets", `service_id = '${service_id}'`);
            if (assets.length > 0) {
                return this.makeResponse(100, "Accepted assets fetched successfully", assets);
            } else {
                return this.makeResponse(404, "No accepted assets found for the given service");
            }
        } catch (error) {
            console.error("Error in getAcceptedAssets:", error);
            return this.makeResponse(203, "Error fetching accepted assets");
        }
    }

    // Update a service's details
    async updateService(service_id: number, newData: any) {
        try {
            const updatedService = await this.updateData('services', `service_id = '${service_id}'`, newData);
            return this.makeResponse(100, "Service updated successfully", updatedService);
        } catch (error) {
            console.error("Error in updateService:", error);
            return this.makeResponse(203, "Error updating service");
        }
    }

    // Delete a service
    async deleteService(service_id: number) {
        try {
            await this.deleteData('services', `service_id = '${service_id}'`);
            return this.makeResponse(100, "Service deleted successfully");
        } catch (error) {
            console.error("Error in deleteService:", error);
            return this.makeResponse(203, "Error deleting service");
        }
    }

    // Create a new address for a company
    async addAddress(data: any) {
        try {
            const { company_id, address, chain } = data;
            const newAddress = { company_id, address, chain, created_at: new Date() };
            const insertedAddress = await this.insertData('addresses', newAddress);
            return this.makeResponse(100, "Address added successfully", insertedAddress);
        } catch (error) {
            console.error("Error in addAddress:", error);
            return this.makeResponse(203, "Error adding address");
        }
    }

    // Fetch addresses for a specific company
    async getAddresses(company_id: number) {
        try {
            const addresses = await this.selectDataQuery("addresses", `company_id = '${company_id}'`);
            if (addresses.length > 0) {
                return this.makeResponse(100, "Addresses fetched successfully", addresses);
            } else {
                return this.makeResponse(404, "Addresses not found for the given company");
            }
        } catch (error) {
            console.error("Error in getAddresses:", error);
            return this.makeResponse(203, "Error fetching addresses");
        }
    }

}

export default Accounts;
