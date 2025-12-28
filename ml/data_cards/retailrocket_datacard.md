# Data Card: RetailRocket E-commerce Dataset

## Dataset Description
- **Title:** RetailRocket Recommender System Dataset
- **Publisher:** RetailRocket
- **Availability:** Kaggle (Open Data)
- **Period:** May 3, 2015 to September 18, 2015 (4.5 months)
- **Scale:** Large-scale real-world e-commerce interactions.

## Content & Schema
The dataset consists of three main files:

### 1. Events (`events.csv`)
- **timestamp:** Unix timestamp in milliseconds.
- **visitorid:** Unique ID of the visitor.
- **event:** Type of interaction (view, addtocart, transaction).
- **itemid:** Unique ID of the product.
- **transactionid:** ID of the transaction (only for 'transaction' events).

### 2. Item Properties (`item_properties_part1.csv`, `item_properties_part2.csv`)
- **timestamp:** When the property was recorded.
- **itemid:** ID of the item.
- **property:** Property name (encoded for privacy, e.g., 'categoryid', 'available').
- **value:** Value of the property.

### 3. Category Tree (`category_tree.csv`)
- **categoryid:** ID of the category.
- **parentid:** ID of the parent category.

## Preprocessing & Validation
- **Temporal Split:** The system uses a 14-day temporal split. Interactions occurring in the last 14 days are reserved for testing, ensuring the model is evaluated on its ability to predict future behavior.
- **Interaction Weighting:**
    - View: 1
    - Add-to-cart: 50
    - Transaction: 250
- **User Filtering:** Only users with at least 10 interactions are included to ensure sufficient history for collaborative filtering.

## Data Governance & Ethics
- **Anonymization:** User IDs and specific item properties have been hashed or encoded to protect business confidentiality and user privacy.
- **Bias:** The data reflects historical user behavior which may contain "popularity bias".
- **Intended Use:** Research and educational purposes for building recommendation systems.
- **Version Control:** Managed via DVC (Data Version Control). Pipeline tracked in `dvc.yaml`.
