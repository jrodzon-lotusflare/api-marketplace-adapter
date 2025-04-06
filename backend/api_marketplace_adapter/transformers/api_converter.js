/**
 * API Format Converter
 * Converts between legacy API format and new API format
 */

/**
 * Converts a legacy API request to the new API format
 * @param {Object} legacyRequest - Request in legacy format
 * @returns {Object} - Request in new API format
 */
function convertRequestToNewFormat(legacyRequest) {
  const { userID, requestType, requestData } = legacyRequest;
  
  const newRequest = {
    metadata: {
      clientId: userID,
      requestId: generateRequestId(),
      timestamp: new Date().toISOString()
    },
    operation: mapRequestTypeToOperation(requestType),
    payload: {}
  };

  // Handle different request types
  switch (requestType) {
    case 'get_account_details':
      newRequest.payload = {
        accountQuery: {
          userId: userID
        }
      };
      break;
    
    case 'update_personal_info':
      newRequest.payload = {
        accountUpdate: {
          userId: userID,
          personalInfo: {
            name: requestData.name,
            email: requestData.email,
            phone: requestData.phone || null,
            address: requestData.address ? {
              street: requestData.address.street,
              city: requestData.address.city,
              state: requestData.address.state,
              zipCode: requestData.address.zip,
              country: requestData.address.country
            } : null
          }
        }
      };
      break;
    
    case 'get_transaction_history':
      newRequest.payload = {
        transactionQuery: {
          userId: userID,
          filters: {
            startDate: requestData.dateRange?.start || null,
            endDate: requestData.dateRange?.end || null,
            category: requestData.category || null,
            minAmount: requestData.amountRange?.min || null,
            maxAmount: requestData.amountRange?.max || null
          },
          pagination: {
            limit: requestData.limit || 50,
            offset: requestData.offset || 0
          },
          sortBy: requestData.sortBy || "date",
          sortOrder: requestData.sortOrder || "desc"
        }
      };
      break;
    
    case 'process_payment':
      newRequest.payload = {
        paymentRequest: {
          userId: userID,
          paymentDetails: {
            amount: requestData.amount,
            currency: requestData.currency || "USD",
            description: requestData.description || "",
            method: requestData.paymentMethod || "card",
            sourceId: requestData.sourceId,
            recipient: requestData.recipient || null
          }
        }
      };
      break;
    
    case 'create_subscription':
      newRequest.payload = {
        subscriptionRequest: {
          userId: userID,
          planId: requestData.planId,
          startDate: requestData.startDate || new Date().toISOString(),
          paymentMethod: requestData.paymentMethod || "card",
          autoRenew: requestData.autoRenew !== undefined ? requestData.autoRenew : true
        }
      };
      break;
    
    default:
      newRequest.payload = { ...requestData };
  }
  
  return newRequest;
}

/**
 * Converts a new API response back to the legacy format
 * @param {Object} newResponse - Response in new API format
 * @returns {Object} - Response in legacy format
 */
function convertResponseToLegacyFormat(newResponse) {
  const { metadata, status, data } = newResponse;
  
  const legacyResponse = {
    userID: metadata.clientId,
    requestID: metadata.requestId,
    timestamp: metadata.timestamp,
    status: mapStatusToLegacyStatus(status),
    data: {}
  };
  
  // Handle different response types
  if (data.accountDetails) {
    legacyResponse.data = {
      account: {
        id: data.accountDetails.id,
        name: data.accountDetails.name,
        email: data.accountDetails.email,
        phone: data.accountDetails.phone,
        address: data.accountDetails.address ? {
          street: data.accountDetails.address.street,
          city: data.accountDetails.address.city,
          state: data.accountDetails.address.state,
          zip: data.accountDetails.address.zipCode,
          country: data.accountDetails.address.country
        } : null,
        createdAt: data.accountDetails.createdAt,
        lastUpdated: data.accountDetails.lastUpdated
      }
    };
  } else if (data.transactions) {
    legacyResponse.data = {
      transactions: data.transactions.map(tx => ({
        id: tx.id,
        date: tx.date,
        amount: tx.amount,
        currency: tx.currency,
        description: tx.description,
        category: tx.category,
        status: tx.status
      })),
      pagination: {
        total: data.pagination.total,
        limit: data.pagination.limit,
        offset: data.pagination.offset,
        hasMore: data.pagination.hasMore
      }
    };
  } else if (data.paymentResult) {
    legacyResponse.data = {
      paymentId: data.paymentResult.paymentId,
      status: data.paymentResult.status,
      amount: data.paymentResult.amount,
      currency: data.paymentResult.currency,
      timestamp: data.paymentResult.timestamp,
      confirmationCode: data.paymentResult.confirmationCode
    };
  } else if (data.subscription) {
    legacyResponse.data = {
      subscriptionId: data.subscription.id,
      planId: data.subscription.planId,
      status: data.subscription.status,
      startDate: data.subscription.startDate,
      nextBillingDate: data.subscription.nextBillingDate,
      autoRenew: data.subscription.autoRenew
    };
  } else {
    legacyResponse.data = data;
  }
  
  return legacyResponse;
}

/**
 * Maps legacy request types to new API operations
 * @param {string} requestType - Legacy request type
 * @returns {string} - New API operation
 */
function mapRequestTypeToOperation(requestType) {
  const operationMap = {
    'get_account_details': 'GET_ACCOUNT',
    'update_personal_info': 'UPDATE_ACCOUNT',
    'get_transaction_history': 'GET_TRANSACTIONS',
    'process_payment': 'PROCESS_PAYMENT',
    'create_subscription': 'CREATE_SUBSCRIPTION'
  };
  
  return operationMap[requestType] || requestType.toUpperCase();
}

/**
 * Maps new API status to legacy status
 * @param {string} status - New API status
 * @returns {string} - Legacy status
 */
function mapStatusToLegacyStatus(status) {
  const statusMap = {
    'SUCCESS': 'success',
    'FAILURE': 'error',
    'PENDING': 'pending',
    'PARTIAL': 'partial'
  };
  
  return statusMap[status] || status.toLowerCase();
}

/**
 * Generates a unique request ID
 * @returns {string} - Unique request ID
 */
function generateRequestId() {
  return 'req_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Export functions for use in other modules
module.exports = {
  convertRequestToNewFormat,
  convertResponseToLegacyFormat
}; 