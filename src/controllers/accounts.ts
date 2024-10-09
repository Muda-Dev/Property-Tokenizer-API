import express, { Request, Response } from 'express';
import CompanyServices from '../models/accounts';

const router = express.Router();
const companyServices = new CompanyServices();

// Middleware to apply JWT verification conditionally
const applyJWTConditionally = (req: Request, res: Response, next: any) => {
  const exemptedRoutes = ["login", "loginWithPhone", "signup", "verifyEmail", "verifyPhone", "marketplace"]; // Add any exempted routes here
  if (!exemptedRoutes.includes(req.path.split('/')[1])) {
    // Apply JWT verification
    // Assuming JWTMiddleware.verifyToken is a static method
    //JWTMiddleware.verifyToken(req, res, next);
    // Instead of the above, you can directly use JWTMiddleware.verifyToken(req, res, next);
    next();
  } else {
    next();
  }
};

// New routes for the additional functionalities
router.post('/signup', applyJWTConditionally, signup);
router.post('/login', applyJWTConditionally, login);
router.post('/loginWithPhone', applyJWTConditionally, loginWithPhone);
router.post('/verifyEmail', applyJWTConditionally, verifyEmail);
router.post('/verifyPhone', applyJWTConditionally, verifyPhone);
router.get('/marketplace', applyJWTConditionally, browseMarketplace);
router.get('/property/:id', applyJWTConditionally, viewPropertyDetails);
router.post('/purchaseShares', applyJWTConditionally, purchaseShares);
router.get('/myProperties', applyJWTConditionally, viewMyProperties);
router.get('/wallet', applyJWTConditionally, viewWallet);
router.get('/transactionHistory', applyJWTConditionally, viewTransactionHistory);
router.post('/admin/addProperty', applyJWTConditionally, addProperty);
router.post('/admin/distributeRent', applyJWTConditionally, distributeRent);
router.get('/admin/viewUsers', applyJWTConditionally, viewUsers);
router.get('/admin/transactionHistory', applyJWTConditionally, viewTransactionHistory);

// Route handler function for logging in
async function login(req: Request, res: Response) {
  try {
    const result = await companyServices.login(req.body);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error });
  }
}

// Route handler function for logging in with phone number
async function loginWithPhone(req: Request, res: Response) {
  try {
    const result = await companyServices.loginWithPhone(req.body);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error logging in with phone', error });
  }
}

// Route handler function for signing up
async function signup(req: Request, res: Response) {
  try {
    const result = await companyServices.signup(req.body);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error signing up', error });
  }
}

// Route handler function for email verification
async function verifyEmail(req: Request, res: Response) {
  try {
    const result = await companyServices.verifyEmail(req.body);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error verifying email', error });
  }
}

// Route handler function for phone verification
async function verifyPhone(req: Request, res: Response) {
  try {
    const result = await companyServices.verifyPhone(req.body);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error verifying phone', error });
  }
}

// Route handler function for browsing the marketplace
async function browseMarketplace(req: Request, res: Response) {
  try {
    const result = await companyServices.browseMarketplace();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error browsing marketplace', error });
  }
}

// Route handler function for viewing property details
async function viewPropertyDetails(req: Request, res: Response) {
  try {
    const propertyId = req.params.id;
    const result = await companyServices.viewPropertyDetails(Number(propertyId));
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error viewing property details', error });
  }
}

// Route handler function for purchasing property shares
async function purchaseShares(req: Request, res: Response) {
  try {
    const result = await companyServices.purchaseShares(req.body);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error purchasing shares', error });
  }
}

// Route handler function for viewing owned properties
async function viewMyProperties(req: Request, res: Response) {
  try {
    const userId = req.params.id; // Assuming user ID is available in the request object
    const result = await companyServices.viewMyProperties(Number(userId));
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error viewing properties', error });
  }
}

// Route handler function for viewing wallet
async function viewWallet(req: Request, res: Response) {
  try {
    const userId = req.params.id; // Assuming user ID is available in the request object
    const result = await companyServices.viewWallet(Number(userId));
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error viewing wallet', error });
  }
}

// Route handler function for viewing transaction history
async function viewTransactionHistory(req: Request, res: Response) {
  try {
    const userId = req.params.id; // Assuming user ID is available in the request object
    const result = await companyServices.viewTransactionHistory(Number(userId));
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error viewing transaction history', error });
  }
}

// Route handler function for adding a property (Admin)
async function addProperty(req: Request, res: Response) {
  try {
    const result = await companyServices.addProperty(req.body);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error adding property', error });
  }
}

// Route handler function for distributing rent (Admin)
async function distributeRent(req: Request, res: Response) {
  try {
    const result = await companyServices.distributeRent(req.body);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error distributing rent', error });
  }
}

// Route handler function for viewing users (Admin)
async function viewUsers(req: Request, res: Response) {
  try {
    const result = await companyServices.viewUsers();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error viewing users', error });
  }
}

export default router;