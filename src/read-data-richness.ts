// SPDX-FileCopyrightText: 2026 Xquik Contributors
//
// SPDX-License-Identifier: MIT

const MEDIA_RESPONSE_FIELDS =
  'mediaUrl type url allowDownload altText aspectRatio availabilityStatus displayUrl durationMillis expandedUrl faceRects focusRects height id indices mediaKey monetizable sizes videoVariants width'.split(' ');

const USER_RESPONSE_FIELDS = [
  ...'id username name description followers following verified isBlueVerified isVerified profilePicture coverPicture profileBannerUrl location createdAt statusesCount mediaCount protected url favouritesCount hasCustomTimelines isTranslator withheldInCountries possiblySensitive pinnedTweetIds isAutomated automatedBy unavailable unavailableReason verifiedType affiliatesHighlightedLabel businessAccountAffiliatesCount creatorSubscriptionsCount hasGraduatedAccess'.split(' '),
  ['hasHiddenSubscriptions', 'OnProfile'].join(''),
  ...'highlightsInfo identityVerification isProfileTranslatable parodyCommentaryFanLabel profileDescriptionLanguage profileImageShape profileInterstitialType profileSortEnabled profileTranslatorType superFollowEligible communityRole profile_bio'.split(' '),
];

const TWEET_RESPONSE_FIELDS =
  'id text createdAt isNoteTweet isReply isLimitedReply isQuoteStatus conversationId source type url lang inReplyToId inReplyToUserId inReplyToUsername displayTextRange contentDisclosure article card communityNote edit isTranslatable noteTweet place possiblySensitive previousCounts viewState entities quoted_tweet retweeted_tweet retweetCount replyCount likeCount quoteCount viewCount bookmarkCount'.split(' ');

function objectShape(fields: readonly string[]): string {
  return `{ ${fields.join(', ')} }`;
}

const RESPONSE_MEDIA = objectShape(MEDIA_RESPONSE_FIELDS);
const RESPONSE_USER = objectShape(USER_RESPONSE_FIELDS);
const RESPONSE_TWEET =
  `{ ${TWEET_RESPONSE_FIELDS.join(', ')}, media?: [${RESPONSE_MEDIA}], author?: ${RESPONSE_USER} }`;
const RESPONSE_TWEET_BASIC = RESPONSE_TWEET;
const RESPONSE_TWEETS_PAGINATED =
  `{ tweets: [${RESPONSE_TWEET}], has_next_page, next_cursor }`;
const RESPONSE_USERS_PAGINATED =
  `{ users: [${RESPONSE_USER}], has_next_page, next_cursor }`;

export {
  MEDIA_RESPONSE_FIELDS,
  RESPONSE_TWEET,
  RESPONSE_TWEET_BASIC,
  RESPONSE_TWEETS_PAGINATED,
  RESPONSE_USER,
  RESPONSE_USERS_PAGINATED,
  TWEET_RESPONSE_FIELDS,
  USER_RESPONSE_FIELDS,
};
