const { BrewingGuide, BrewingGuideProduct } = require('../models');

exports.getAllBrewingGuides = async (req, res) => {
    try {
        const guides = await BrewingGuide.find().sort({ createdAt: -1 }).lean();
        
        // Gắn thêm danh sách sản phẩm liên quan cho từng bài hướng dẫn
        const guidesWithProducts = await Promise.all(guides.map(async (g) => {
            const bridgeEntries = await BrewingGuideProduct.find({ brewingGuideId: g._id }).populate('productId');
            const products = bridgeEntries.map(be => be.productId).filter(p => p !== null);
            // Thêm dòng này để Frontend (vốn đang tìm guide.product) có dữ liệu hiện lên
            return { ...g, products, product: products[0] || null };
        }));

        res.json({ data: guidesWithProducts });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getBrewingGuideById = async (req, res) => {
    try {
        const guide = await BrewingGuide.findById(req.params.id).lean();
        if (!guide) return res.status(404).json({ message: 'Không tìm thấy hướng dẫn!' });
        
        const bridgeEntries = await BrewingGuideProduct.find({ brewingGuideId: guide._id }).populate('productId');
        const products = bridgeEntries.map(be => be.productId).filter(p => p !== null);
        
        res.json({ data: { ...guide, products, product: products[0] || null } });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createBrewingGuide = async (req, res) => {
    try {
        const { title, content, productIds } = req.body;
        const guide = new BrewingGuide({ title, content });
        await guide.save();
        
        if (productIds && Array.isArray(productIds)) {
            const bridgeEntries = productIds.map(pid => ({ brewingGuideId: guide._id, productId: pid }));
            await BrewingGuideProduct.insertMany(bridgeEntries);
        }
        
        res.status(201).json({ message: 'Thêm hướng dẫn thành công!', guide });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateBrewingGuide = async (req, res) => {
    try {
        const { title, content, productIds } = req.body;
        const guide = await BrewingGuide.findByIdAndUpdate(req.params.id, { title, content }, { new: true });
        
        if (!guide) return res.status(404).json({ message: 'Không tìm thấy hướng dẫn!' });

        if (productIds && Array.isArray(productIds)) {
            // Xóa liên kết cũ và thêm mới cho đơn giản
            await BrewingGuideProduct.deleteMany({ brewingGuideId: guide._id });
            const bridgeEntries = productIds.map(pid => ({ brewingGuideId: guide._id, productId: pid }));
            await BrewingGuideProduct.insertMany(bridgeEntries);
        }

        res.json({ message: 'Cập nhật hướng dẫn thành công!', guide });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteBrewingGuide = async (req, res) => {
    try {
        const guide = await BrewingGuide.findByIdAndDelete(req.params.id);
        if (!guide) return res.status(404).json({ message: 'Không tìm thấy hướng dẫn!' });
        
        // Xóa luôn các liên kết sản phẩm liên quan
        await BrewingGuideProduct.deleteMany({ brewingGuideId: req.params.id });
        
        res.json({ message: 'Xóa hướng dẫn thành công!' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
