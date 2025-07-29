import { Request, Response } from 'express';
export declare const getAllInventory: (req: Request, res: Response) => Promise<void>;
export declare const getInventoryItem: (req: Request, res: Response) => Promise<void>;
export declare const createInventoryItem: (req: Request, res: Response) => Promise<void>;
export declare const updateInventoryItem: (req: Request, res: Response) => Promise<void>;
export declare const deleteInventoryItem: (req: Request, res: Response) => Promise<void>;
export declare const adjustStock: (req: Request, res: Response) => Promise<void>;
export declare const getLowStockAlerts: (req: Request, res: Response) => Promise<void>;
export declare const getInventoryAnalytics: (req: Request, res: Response) => Promise<void>;
export declare const bulkStockAdjustment: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=inventoryController.d.ts.map