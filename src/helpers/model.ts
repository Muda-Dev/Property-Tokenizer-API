import BaseModel from "./base.model";
import { get } from "./httpRequest";
import { v4 as uuidv4 } from 'uuid';
import EmailSender from './email.helper'
import Flutterwave from "./Flutterwave";
const flw = new Flutterwave();
const mailer = new EmailSender()

export default class Model extends BaseModel {

    makeResponse(status: number, message: string, data: any = null) {
        return {
            status,
            message,
            data: data !== null ? data : undefined
        };
    }

    getRandomString() {
        const uuid = uuidv4();
        return uuid.replace(/-/g, '');
    }
    async getDocumentTypes() {
        return await this.selectDataQuery("document_type");
    }

    async getDocumentType(docId: string) {
        return await this.selectDataQuery("document_type", `doc_code='${docId}'`);
    }



    async getDefaultDocumentTypes() {
        return await this.selectDataQuery("document_type", `is_default='yes'`);
    }


    async getUserCompanies(user_id: string) {
        return await this.callRawQuery(`SELECT * FROM company_members m INNER JOIN company c ON m.company_id = c.company_id where m.user_id ='${user_id}' `);
    }

    async getUserCompany(company_id: string, user_id: string) {
        return await this.callRawQuery(`SELECT * FROM company_members m INNER JOIN company c ON m.company_id = c.company_id where  m.company_id = '${company_id}' AND m.user_id ='${user_id}' `);
    }



    async getUserByEmail(email: string) {
        return await this.callRawQuery(`SELECT * FROM users u inner join company_members c ON u.user_id = c.user_id where email ='${email}' `);
    }

    async getUserById(userId: string) {
        return await this.callRawQuery(`SELECT * FROM users u inner join company_members c ON u.user_id = c.user_id where staff_id = '${userId}' OR u.user_id='${userId}' `);
    }

    async getLoggedInUser(staff_id: string, password: string) {
        return await this.callRawQuery(`SELECT * FROM users u inner join company_members c ON u.user_id = c.user_id where staff_id = '${staff_id}' AND u.password='${password}' `);
    }

    async getDocument(doc_id: string) {
        return await this.callRawQuery(`SELECT * FROM documents d INNER JOIN company c ON d.owner_id = c.company_id INNER JOIN document_type t ON d.doc_type= t.doc_code where d.doc_id = '${doc_id}'`);
    }


    async ShareLog(request_id: string) {
        return await this.callRawQuery(`SELECT * FROM document_share_log_docs s INNER JOIN documents d ON s.doc_id=d.doc_id INNER JOIN company c ON d.owner_id = c.company_id INNER JOIN document_type t ON d.doc_type= t.doc_code where s.request_id = '${request_id}'`);
    }



    async CompanysharedDocuments(company_id: string, company_rec_id: any) {
        const rs =  await this.callRawQuery(`SELECT * FROM document_share_log_docs d inner join document_share_log v ON d.request_id=v.request_id where (v.sender_id = '${company_id}' AND v.receiver_id = '${company_rec_id}') OR ( v.sender_id = '${company_rec_id}' AND v.receiver_id = '${company_id}')   `);
        const response = []
        for (let i = 0; i < rs.length; i++) {
            const docId = rs[i]['doc_id']
            const docInfo = await this.getDocument(docId)
            const rcDoc = docInfo[0];
            const rsp = {
                ...rs[i],
                ...rcDoc
            }
            response.push(rsp)
        }
        return response
    }


    async requestLog(request_id: string) {
        // Fetch the log documents based on the request_id
        const rs = await this.callRawQuery(`SELECT * FROM document_share_log_docs s INNER JOIN document_type d ON s.doc_type_id=d.doc_code where s.request_id = '${request_id}'`);
        const sender = await this.getShareSender(request_id);
        const senderInfo = sender[0] || {}; // Ensure there's a fallback to prevent errors if no sender is found
        const response = rs.map(element => {
            const obj = { ...element, ...senderInfo };
            return obj;
        });

        return response;
    }


    async getShareSender(request_id: string) {
        return await this.callRawQuery(`SELECT * FROM document_share_log v  INNER JOIN company c on  v.sender_id  = c.company_id where v.request_id = '${request_id}' `);
    }


    async getInformationUser(staff_id: string) {
        return await this.callRawQuery(`SELECT * FROM users u INNER JOIN company_members c ON u.user_id = c.user_id INNER JOIN company y ON c.company_id=y.company_id  where c.staff_id = '${staff_id}'`);
    }

    async verificationRequests(owner_id: string) {
        return await this.callRawQuery(`SELECT *, count(*) as number_of_documents FROM verification_requests v INNER JOIN documents d ON v.doc_id=d.doc_id INNER JOIN company c ON d.owner_id = c.company_id INNER JOIN document_type t ON d.doc_type= t.doc_code where d.owner_id = '${owner_id}' AND v.status='pendingVerification' group by v.request_id`);
    }


    async DocumentsIVerifiy(owner_id: string) {
        return await this.callRawQuery(`SELECT * FROM verifiers v INNER JOIN document_type t ON v.doc_id= t.doc_code INNER JOIN countries c ON v.country_id = c.id where v.company_id = '${owner_id}' AND v.status !='deleted'`);
    }


    async approvalRequests(owner_id: string, recId: string) {
        return await this.callRawQuery(`SELECT *, count(*) as number_of_documents FROM document_share_log v INNER JOIN documents d ON v.doc_id=d.doc_id INNER JOIN company c ON d.owner_id = c.company_id INNER JOIN document_type t ON d.doc_type= t.doc_code where v.receiver_id = '${owner_id}' OR  v.sender_id = '${owner_id}' OR  v.receiver_email='${recId}' group by v.request_id`);
    }


    async getCompanyProfile(company_id: string) {

        return await this.callRawQuery(`SELECT * from company c INNER JOIN users u ON c.contact_user_id = u.user_id  INNER JOIN countries t ON c.country_code=t.id WHERE company_id = '${company_id}' OR domain='${company_id}' `);
    }






    async SingleRequest(request_id: string) {
        return await this.callRawQuery(`SELECT * FROM verification_requests v INNER JOIN documents d ON v.doc_id=d.doc_id INNER JOIN company c ON d.owner_id = c.company_id INNER JOIN document_type t ON d.doc_type= t.doc_code where v.request_id = '${request_id}'`);
    }






    async convertUsdToCurrency(usdAmount: any, targetCurrency: any) {
        console.log("SWAPPER", usdAmount, targetCurrency)
        const ratesObj = await this.selectDataQuery("rate_cache");
        const rate_object = ratesObj[0]['rate_object']
        const ratesJSON = JSON.parse(rate_object)
        const rates = ratesJSON.rates;
        // console.log("RATESINFO", rates)

        const rate = rates[targetCurrency];
        console.log("SWAPPER==>2", rate)
        let rateAmount = 0;

        if (!rate) {
            console.error("Invalid currency code or rate not available.");
            // return 0;
        } else {
            usdAmount * rate;
        }
        rateAmount = usdAmount * rate;
        console.log("SWAPPER==>3", rateAmount)
        return rateAmount;

    }

    async sendEmail(operation: string, email: string, name = "", otp = "", tableData: any = [], code: string = '') {
        try {
            const messageBody = await this.selectDataQuery("notification_templates", `operation = '${operation}'`);
            if (messageBody.length == 0) {
                return this.makeResponse(404, "operation not found");
            }

            // Start of the unordered list
            let listHtml = "<ul>";
            // Assuming tableData is an array of objects
            tableData.forEach((item: any) => {
                listHtml += `<li>${item}</li>`;
            });
            listHtml += "</ul>";

            const message = messageBody[0]['body'];
            const subject = messageBody[0]['title'];

            const new_message = this.constructSMSMessage(message, name, otp, listHtml, code);
            mailer.sendMail(email, subject, subject, new_message);
            this.saveNotification(subject, email, message);
            return true;

        } catch (error) {
            return this.makeResponse(203, "Error fetching company");
        }
    }




    constructSMSMessage(template: string, name: string, otp: string, listHtml: any, code: string): string {
        const data: any = {
            name,
            otp,
            code,
            listHtml
        };

        for (const key in data) {
            if (Object.prototype.hasOwnProperty.call(data, key)) {
                template = template.replace(new RegExp(`{${key}}`, 'g'), data[key]);
            }
        }

        return template;
    }


    async fetchCompanyById(companyId: string) {
        return await this.selectDataQuery("company", `company_id = '${companyId}'`);

    }

    async getCompanyById(companyId: string) {

        try {
            const companies = await this.selectDataQuery("company", `company_id = '${companyId}'`);
            if (companies.length > 0) {
                return this.makeResponse(100, "Company fetched successfully", companies[0]);
            } else {
                return this.makeResponse(404, "Company not found");
            }
        } catch (error) {
            console.error("Error in getCompanyById:", error);
            return this.makeResponse(203, "Error fetching company");
        }
    }
    async getUserByStaffId(staffId: string, companyId: string) {
        const companies: any = await this.callQuery(`select * from company_members m INNER JOIN company c ON m.company_id = c.company_id INNER JOIN users u ON m.user_id = u.user_id where m.staff_id = '${staffId}' AND m.company_id = '${companyId}'`);
        return companies;
    }

    generateRandom4DigitNumber() {
        const min = 100000;
        const max = 999999;

        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    // Utility function to validate if the domain is valid
    validateDomain(domain: string) {
        // Regular expression for validating a basic domain format (e.g., example.com)
        // This regex will check for a general pattern like "example.com", without protocols, subdomains, or paths
        const domainRegex = /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

        // Clean the domain by removing protocols, www, and paths
        let cleanDomain = domain.replace(/^(?:https?:\/\/)?(?:www\.)?/, '').split('/')[0];

        // Validate the cleaned domain against the regex
        return domainRegex.test(cleanDomain);
    }


    validateAndCleanDomain(domain: string) {
        let cleanDomain = domain.replace(/^(?:https?:\/\/)?(?:www\.)?/, '').split('/')[0];
        return cleanDomain;
    }

    // Utility function to check if the email's domain matches the company's domain
    doesEmailDomainMatch(email: any, domain: any) {
        const emailDomain = email.split('@')[1];
        return emailDomain === domain;
    }
    async getDocumentByCompanyId(companyId: any, docId: string) {
        return await this.callRawQuery(`SELECT * FROM documents where owner_id = '${companyId}' AND doc_type='${docId}' AND doc_status!='expired' `);
    }

    async getOTP(email: string, user_id: string, otpType: string = 'otp') {
        const user: any = await this.selectDataQuery("user_otp", `user_id = '${user_id}'`);
        let otp = this.generateRandom4DigitNumber().toString();

        if (otpType == 'code') {
            otp = this.getRandomString();
        }
        const userInfo = {
            user_id,
            email,
            otp
        }
        if (user.length == 0) {
            const insertedUser = await this.insertData('user_otp', userInfo);
        } else {
            await this.updateData('user_otp', `user_id = '${user_id}'`, userInfo);

        }
        return otp
    }



    async AddConnection(company_id: string, rec_company_id: string) {
        const userInfo = {
            company_a_id: company_id,
            company_b_id: rec_company_id,
        }
        const insertedUser = await this.insertData('connections', userInfo);

        return true
    }


    async createWallet(company_id: string, currency: string = 'USD') {
        const walletExists = await this.selectDataQuery("company_wallets", `company_id = '${company_id}'`);
        if (walletExists.length > 0) {
            return walletExists[0]['wallet_id'];
        }

        const wallet_id = this.generateRandom4DigitNumber().toString();
        const userInfo = {
            wallet_id,
            company_id,
            currency,
            running_balance: 0,
        }
        await this.insertData('company_wallets', userInfo);
        return wallet_id
    }



    async updateWalletBalance(drWallet: string, crWallet: string, amount: string, opType: string = 'transfer') {
        // Convert amount to a number for calculations
        const transferAmount = parseFloat(amount);
        if (isNaN(transferAmount) || transferAmount <= 0) {
            return "Invalid transfer amount.";
        }

        let drOldBalance = 0;
        if (opType == 'transfer') {
            // Check if the debit wallet exists and has sufficient balance
            const drWalletExists = await this.selectDataQuery("company_wallets", `wallet_id = '${drWallet}'`);
            if (drWalletExists.length === 0) {
                return "Debit wallet not found.";
            }
            drOldBalance = parseFloat(drWalletExists[0]['running_balance']);
            if (drOldBalance < transferAmount) {
                return "Insufficient funds in debit wallet.";
            }
        }

        // Check if the credit wallet exists
        const crWalletExists = await this.selectDataQuery("company_wallets", `wallet_id = '${crWallet}'`);
        if (crWalletExists.length === 0) {
            return "Credit wallet not found.";
        }
        const crOldBalance = parseFloat(crWalletExists[0]['running_balance']);

        // Calculate new balances
        const crNewBalance = crOldBalance + transferAmount;

        if (opType == 'transfer') {
            const drNewBalance = drOldBalance - transferAmount;
            await this.updateData('company_wallets', `wallet_id = '${drWallet}'`, { running_balance: drNewBalance.toString() });
        }
        await this.updateData('company_wallets', `wallet_id = '${crWallet}'`, { running_balance: crNewBalance.toString() });

        return "success";
    }






    async createPendingTransaction(company_id: any, user_id: string, payment_method_id: any, usd_amount: any, amount: any, currency: string, description: any, reference_id: any) {
        try {




            const name = "UNIFID"
            const email = "info@muda.exchange"
            const phone = ""

            const rsp: any = await flw.InitiateTransactionRequest(reference_id, amount, email, phone, name, currency);
            console.log("FlutterwaveTransactions", rsp)
            const rspData = JSON.parse(rsp);
            let respMessage = rspData['status'];

            if (respMessage == "success") {
                const hosted_link = rspData['data']['link'];
                respMessage = hosted_link;


                const newTransaction = {
                    company_id,
                    payment_link: hosted_link,
                    amount,
                    user_id,
                    currency,
                    usd_amount,
                    status: 'pending',
                    description,
                    reference_id
                };

                const insertedTransaction = await this.insertData('transactions', newTransaction);
                return this.makeResponse(100, "Pending transaction created successfully", newTransaction);

            } else {
                return this.makeResponse(203, "Pending creation Failed",[]);

            }

        } catch (error) {
            console.error("Error in createPendingTransaction:", error);
            return this.makeResponse(203, "Error creating transaction");
        }
    }

    async countries() {
        const rs: any = await this.callQuery(`select * from countries `);
        return rs;
    }
    async getCountryById(id: any) {
        const rs: any = await this.callQuery(`select * from countries where id='${id}' `);
        return rs;
    }




    // Function to update transaction status based on webhook confirmation
    async updateTransactionStatus(transaction_id: string, status: string) {
        try {
            if (!['completed', 'failed'].includes(status)) {
                return this.makeResponse(400, "Invalid status value");
            }

            // Check if transaction_id exists
            const transactionExists = await this.selectDataQuery("transactions", `transaction_id = '${transaction_id}'`);
            if (transactionExists.length === 0) {
                return this.makeResponse(404, "Transaction not found");
            }

            await this.updateData('transactions', `transaction_id = '${transaction_id}'`, { status: status });
            return this.makeResponse(100, "Transaction status updated successfully");
        } catch (error) {
            console.error("Error in updateTransactionStatus:", error);
            return this.makeResponse(203, "Error updating transaction status");
        }


    }


    async saveNotification(title: string, company_id: string, message: any) {
        const newUser = {
            title,
            company_id,
            message
        };
        return await this.insertData('notifications', newUser);
    }

    async getDocVerifiers(c: string) {
        return await this.callQuery(`select * from verifiers where doc_id='${c}'`);
    }



    async GetVerificationPrice(doc_id: any, country_id: any) {
        let price: any = await this.selectDataQuery("doc_prices", `doc_id = '${doc_id}' AND country_id= '${country_id}'`);
        // let price: any = await this.selectDataQuery("doc_prices", `doc_id = '${doc_id}' AND country_id= '${country_id}'`);
        if (price.length == 0) {
            return "0"
        }
        return price[0]['verification_price'];
    }




}