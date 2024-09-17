import express, { Request, Response } from 'express';
import CompanyServices from '../models/accounts';

const router = express.Router();
const companyServices = new CompanyServices();

// Middleware to apply JWT verification conditionally
const applyJWTConditionally = (req: Request, res: Response, next: any) => {
  const exemptedRoutes = ["login"]; // Add any exempted routes here
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

router.post('/addAddress', applyJWTConditionally, addAddress);
router.get('/getAddresses', applyJWTConditionally, getAddresses);
router.delete('/deleteService', applyJWTConditionally, deleteService);
router.get('/getCompanies', applyJWTConditionally, getCompanies);
router.put('/updateService', applyJWTConditionally, updateService);
router.get('/getAcceptedAssets', applyJWTConditionally, getAcceptedAssets);
router.post('/addAcceptedAsset', applyJWTConditionally, addAcceptedAsset);
router.get('/getServices', applyJWTConditionally, getServices);
router.post('/addService', applyJWTConditionally, addService);
router.post('/login', login);
router.post('/register', applyJWTConditionally, addCompany);

// Route handler function for adding a company
async function login(req: Request, res: Response) {
  try {
    const result = await companyServices.login(req.body);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error adding company', error });
  }
}

// Route handler function for adding a company
async function addCompany(req: Request, res: Response) {
  try {
    const result = await companyServices.addCompany(req.body);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error adding company', error });
  }
}

// Route to add a company

// Route handler function for getting all companies
async function getCompanies(req: Request, res: Response) {
  try {
    const result = await companyServices.getCompanies();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching companies', error });
  }
}

// Route to get companies

// Route handler function for adding a service
async function addService(req: Request, res: Response) {
  try {
    const result = await companyServices.addService(req.body);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error adding service', error });
  }
}

// Route to add a service

// Route handler function for getting services
async function getServices(req: Request, res: Response) {
  try {
    const result = await companyServices.getServices(req.body.company_id);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching services', error });
  }
}

// Route to get services

// Route handler function for adding an accepted asset
async function addAcceptedAsset(req: Request, res: Response) {
  try {
    const result = await companyServices.addAcceptedAsset(req.body);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error adding accepted asset', error });
  }
}

// Route to add an accepted asset

// Route handler function for getting accepted assets
async function getAcceptedAssets(req: Request, res: Response) {
  try {
    const result = await companyServices.getAcceptedAssets(req.body.service_id);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching accepted assets', error });
  }
}

// Route to get accepted assets

// Route handler function for updating a service
async function updateService(req: Request, res: Response) {
  try {
    const result = await companyServices.updateService(req.body.service_id, req.body.newData);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error updating service', error });
  }
}

// Route to update a service

// Route handler function for deleting a service
async function deleteService(req: Request, res: Response) {
  try {
    const result = await companyServices.deleteService(req.body.service_id);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error deleting service', error });
  }
}

// Route to delete a service

// Route handler function for adding an address
async function addAddress(req: Request, res: Response) {
  try {
    const result = await companyServices.addAddress(req.body);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error adding address', error });
  }
}

// Route to add an address

// Route handler function for getting addresses
async function getAddresses(req: Request, res: Response) {
  try {
    const result = await companyServices.getAddresses(req.body.company_id);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching addresses', error });
  }
}

// Route to get addresses

export default router;
