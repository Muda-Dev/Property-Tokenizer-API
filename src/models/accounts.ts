import Model from "../helpers/model";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import AWS from "aws-sdk";

class Accounts extends Model {
  private s3: AWS.S3;

  constructor() {
    super();
    AWS.config.update({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION,
    });
    this.s3 = new AWS.S3();
  }

  private hashPassword(password: string) {
    const hash = crypto.createHash("sha256");
    return hash.update(password).digest("hex");
  }

  async login(data: any) {
    const { email, password } = data;
    const hashPassword = this.hashPassword(password);

    try {
      const users = await this.selectDataQuery(
        "users",
        `email = '${email}' and password='${hashPassword}'`
      );
      const user = users.length > 0 ? users[0] : null;

      if (!user) {
        return this.makeResponse(203, "User not found");
      }
      let user_id = user.user_id;
      const jwts: any = process.env.JWT_SECRET;
      const token = jwt.sign({ user_id }, jwts, {
        expiresIn: 86400, // 24 hours
      });
      const response = { ...user, jwt: token };
      return this.makeResponse(100, "Login successful", response);
    } catch (error) {
      console.error("Error in login:", error);
      return this.makeResponse(203, "Error logging in");
    }
  }

  async loginWithPhone(data: any) {
    const { phone, password } = data;
    const hashPassword = this.hashPassword(password);

    try {
      const users = await this.selectDataQuery(
        "users",
        `phone = '${phone}' and password='${hashPassword}'`
      );
      const user = users.length > 0 ? users[0] : null;

      if (!user) {
        return this.makeResponse(203, "User not found");
      }
      let user_id = user.user_id;
      const jwts: any = process.env.JWT_SECRET;
      const token = jwt.sign({ user_id }, jwts, {
        expiresIn: 86400, // 24 hours
      });
      const response = { ...user, jwt: token };
      return this.makeResponse(100, "Login successful", response);
    } catch (error) {
      console.error("Error in loginWithPhone:", error);
      return this.makeResponse(203, "Error logging in with phone");
    }
  }

  async signup(data: any) {
    try {
      const { firstName, lastName, email, password, phone } = data;
      const existingUsers = await this.selectDataQuery(
        "users",
        `email='${email}'`
      );
      if (existingUsers.length > 0) {
        return this.makeResponse(203, "Email already exists");
      }

      if (password.length < 7) {
        return this.makeResponse(203, "Weak password");
      }

      const hashPassword = this.hashPassword(password);
      const name = `${firstName} ${lastName}`;
      const newUser = { name, email, password: hashPassword, phone };
      const insertedUser = await this.insertData("users", newUser);

      // Send OTP for email verification
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      await this.sendEmailOTP(email, otp);

      return this.makeResponse(
        100,
        "Signup successful, please verify your email",
        insertedUser
      );
    } catch (error) {
      console.error("Error in signup:", error);
      return this.makeResponse(203, "Error signing up");
    }
  }

  async verifyEmail(data: any) {
    try {
      const { email, otp } = data;
      const users = await this.selectDataQuery(
        "email_verifications",
        `email='${email}' and otp='${otp}'`
      );
      if (users.length === 0) {
        return this.makeResponse(203, "Invalid OTP");
      }

      await this.updateData("users", `email='${email}'`, {
        emailVerified: true,
      });
      return this.makeResponse(100, "Email verified successfully");
    } catch (error) {
      console.error("Error in verifyEmail:", error);
      return this.makeResponse(203, "Error verifying email");
    }
  }

  async verifyPhone(data: any) {
    try {
      const { phone, otp } = data;
      const users = await this.selectDataQuery(
        "phone_verifications",
        `phone='${phone}' and otp='${otp}'`
      );
      if (users.length === 0) {
        return this.makeResponse(203, "Invalid OTP");
      }

      await this.updateData("users", `phone='${phone}'`, {
        phoneVerified: true,
      });
      return this.makeResponse(100, "Phone verified successfully");
    } catch (error) {
      console.error("Error in verifyPhone:", error);
      return this.makeResponse(203, "Error verifying phone");
    }
  }

  async browseMarketplace() {
    try {
      const properties = await this.selectDataQuery("properties");
      return this.makeResponse(
        100,
        "Properties fetched successfully",
        properties
      );
    } catch (error) {
      console.error("Error in browseMarketplace:", error);
      return this.makeResponse(203, "Error fetching properties");
    }
  }

  async viewPropertyDetails(propertyId: number) {
    try {
      const properties = await this.selectDataQuery(
        "properties",
        `property_id='${propertyId}'`
      );
      if (properties.length === 0) {
        return this.makeResponse(404, "Property not found");
      }
      return this.makeResponse(
        100,
        "Property details fetched successfully",
        properties[0]
      );
    } catch (error) {
      console.error("Error in viewPropertyDetails:", error);
      return this.makeResponse(203, "Error fetching property details");
    }
  }

  async purchaseShares(data: any) {
    try {
      const { propertyId, amount, paymentMethod } = data;
      const property = await this.selectDataQuery(
        "properties",
        `property_id='${propertyId}'`
      );
      if (property.length === 0) {
        return this.makeResponse(404, "Property not found");
      }

      const shares = amount / property[0].sharePrice;
      const newPurchase = {
        propertyId,
        amount,
        shares,
        paymentMethod,
        createdAt: new Date(),
      };
      const insertedPurchase = await this.insertData("purchases", newPurchase);

      return this.makeResponse(
        100,
        "Shares purchased successfully",
        insertedPurchase
      );
    } catch (error) {
      console.error("Error in purchaseShares:", error);
      return this.makeResponse(203, "Error purchasing shares");
    }
  }

  async viewMyProperties(userId: number) {
    try {
      const properties = await this.selectDataQuery(
        "purchases",
        `user_id='${userId}'`
      );
      return this.makeResponse(
        100,
        "Properties fetched successfully",
        properties
      );
    } catch (error) {
      console.error("Error in viewMyProperties:", error);
      return this.makeResponse(203, "Error fetching properties");
    }
  }

  async viewWallet(userId: number) {
    try {
      const wallet = await this.selectDataQuery(
        "wallets",
        `user_id='${userId}'`
      );
      return this.makeResponse(100, "Wallet fetched successfully", wallet);
    } catch (error) {
      console.error("Error in viewWallet:", error);
      return this.makeResponse(203, "Error fetching wallet");
    }
  }

  async viewTransactionHistory(userId: number) {
    try {
      const transactions = await this.selectDataQuery(
        "transactions",
        `user_id='${userId}'`
      );
      return this.makeResponse(
        100,
        "Transaction history fetched successfully",
        transactions
      );
    } catch (error) {
      console.error("Error in viewTransactionHistory:", error);
      return this.makeResponse(203, "Error fetching transaction history");
    }
  }

  async addProperty(data: any) {
    try {
      const { name, details, value, shares, returnRate, image } = data;
      //const imageUrl = await this.uploadImageToS3(image);
      const imageUrl = "https://placehold.co/600x400/EEE/31343C"
      const newProperty = {
        name,
        details,
        value,
        shares,
        returnRate,
        imageUrl,
      };
      const insertedProperty = await this.insertData("properties", newProperty);
      return this.makeResponse(
        100,
        "Property added successfully",
        insertedProperty
      );
    } catch (error) {
      console.error("Error in addProperty:", error);
      return this.makeResponse(203, "Error adding property");
    }
  }

  async distributeRent(data: any) {
    try {
      const { propertyId, totalRent } = data;
      const property = await this.selectDataQuery(
        "properties",
        `property_id='${propertyId}'`
      );
      if (property.length === 0) {
        return this.makeResponse(404, "Property not found");
      }

      const shares = await this.selectDataQuery(
        "purchases",
        `property_id='${propertyId}'`
      );
      const rentDistribution = shares.map((share: any) => ({
        userId: share.user_id,
        rent: (share.shares / property[0].totalShares) * totalRent,
      }));

      for (const distribution of rentDistribution) {
        await this.updateData("wallets", `user_id='${distribution.userId}'`, {
          rent: distribution.rent,
        });
      }

      return this.makeResponse(100, "Rent distributed successfully");
    } catch (error) {
      console.error("Error in distributeRent:", error);
      return this.makeResponse(203, "Error distributing rent");
    }
  }

  async viewUsers() {
    try {
      const users = await this.selectDataQuery("users");
      return this.makeResponse(100, "Users fetched successfully", users);
    } catch (error) {
      console.error("Error in viewUsers:", error);
      return this.makeResponse(203, "Error fetching users");
    }
  }

  // Upload image to S3
  private async uploadImageToS3(image: any) {
    const bucketName = process.env.S3_BUCKET_NAME;
    if (!bucketName) {
      throw new Error("S3_BUCKET_NAME is not defined in environment variables");
    }

    const params = {
      Bucket: bucketName,
      Key: `${Date.now()}_${image.originalname}`,
      Body: image.buffer,
      ContentType: image.mimetype,
      ACL: "public-read",
    };

    try {
      const data = await this.s3.upload(params).promise();
      return data.Location;
    } catch (error) {
      console.error("Error uploading image to S3:", error);
      throw new Error("Error uploading image");
    }
  }

  // Send OTP to email
  private async sendEmailOTP(email: string, otp: string) {
    // Implement email sending logic here
  }
}

export default Accounts;
