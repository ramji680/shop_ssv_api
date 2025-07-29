import { Request, Response } from 'express';
export declare const getAllProducts: (req: Request, res: Response) => Promise<void>;
export declare const getProduct: (req: Request, res: Response) => Promise<void>;
export declare const createProduct: (req: Request, res: Response) => Promise<void>;
export declare const updateProduct: (req: Request, res: Response) => Promise<void>;
export declare const deleteProduct: (req: Request, res: Response) => Promise<void>;
export declare const getFeaturedProducts: (req: Request, res: Response) => Promise<void>;
export declare const getProductsByCategory: (req: Request, res: Response) => Promise<void>;
export declare const getProductAnalytics: (req: Request, res: Response) => Promise<void>;
export declare const toggleProductAvailability: (req: Request, res: Response) => Promise<void>;
export declare const toggleProductFeatured: (req: Request, res: Response) => Promise<void>;
export declare const updateProductSortOrder: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=productController.d.ts.map