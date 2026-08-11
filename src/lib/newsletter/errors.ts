export class NewsletterCampaignValidationError extends Error {
  status = 400;
}

export class NewsletterCampaignDeliveryError extends Error {
  status = 400;
}
