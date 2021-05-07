export enum CoreErrorCode {
	//#region HTTP STATUS CODES

	/**
	 * The server cannot or will not process the request due to an apparent client error
	 * (e.g., malformed request syntax, too large size, invalid request message framing, or deceptive request routing).
	 */
	BAD_REQUEST = 400,

	/**
	 * Similar to 403 Forbidden, but specifically for use when authentication is required and has failed or has not yet
	 * been provided. The response must include a WWW-Authenticate header field containing a challenge applicable to the
	 * requested resource. See Basic access authentication and Digest access authentication. 401 semantically means
	 * "unauthenticated",i.e. the user does not have the necessary credentials.
	 */
	UNAUTHORIZED = 401,

	/**
	 * Reserved for future use. The original intention was that this code might be used as part of some form of digital
	 * cash or micro payment scheme, but that has not happened, and this code is not usually used.
	 * Google Developers API uses this status if a particular developer has exceeded the daily limit on requests.
	 */
	PAYMENT_REQUIRED = 402,

	/**
	 * The request was valid, but the server is refusing action.
	 * The user might not have the necessary permissions for a resource.
	 */
	FORBIDDEN = 403,

	/**
	 * The requested resource could not be found but may be available in the future.
	 * Subsequent requests by the client are permissible.
	 */
	NOT_FOUND = 404,

	/**
	 * A request method is not supported for the requested resource;
	 * for example, a GET request on a form that requires data to be presented via POST, or a PUT request on a read-only resource.
	 */
	METHOD_NOT_ALLOWED = 405,

	/**
	 * The requested resource is capable of generating only content not acceptable according to the Accept headers sent in the request.
	 */
	NOT_ACCEPTABLE = 406,

	/**
	 * The client must first authenticate itself with the proxy.
	 */
	PROXY_AUTHENTICATION_REQUIRED = 407,

	/**
	 * The server timed out waiting for the request.
	 * According to HTTP specifications:
	 * "The client did not produce a request within the time that the server was prepared to wait. The client MAY repeat the request without modifications at any later time."
	 */
	REQUEST_TIMEOUT = 408,

	/**
	 * Indicates that the request could not be processed because of conflict in the request,
	 * such as an edit conflict between multiple simultaneous updates.
	 */
	CONFLICT = 409,

	/**
	 * Indicates that the resource requested is no longer available and will not be available again.
	 * This should be used when a resource has been intentionally removed and the resource should be purged.
	 * Upon receiving a 410 status code, the client should not request the resource in the future.
	 * Clients such as search engines should remove the resource from their indices.
	 * Most use cases do not require clients and search engines to purge the resource, and a "404 Not Found" may be used instead.
	 */
	GONE = 410,

	/**
	 * The request did not specify the length of its content, which is required by the requested resource.
	 */
	LENGTH_REQUIRED = 411,

	/**
	 * The server does not meet one of the preconditions that the requester put on the request.
	 */
	PRECONDITION_FAILED = 412,

	/**
	 * The request is larger than the server is willing or able to process. Previously called "Request Entity Too Large".
	 */
	PAYLOAD_TOO_LARGE = 413,

	/**
	 * The URI provided was too long for the server to process. Often the result of too much data being encoded as a query-string of a GET request,
	 * in which case it should be converted to a POST request.
	 * Called "Request-URI Too Long" previously.
	 */
	URI_TOO_LONG = 414,

	/**
	 * The request entity has a media type which the server or resource does not support.
	 * For example, the client uploads an image as image/svg+xml, but the server requires that images use a different format.
	 */
	UNSUPPORTED_MEDIA_TYPE = 415,

	/**
	 * The client has asked for a portion of the file (byte serving), but the server cannot supply that portion.
	 * For example, if the client asked for a part of the file that lies beyond the end of the file.
	 * Called "Requested Range Not Satisfiable" previously.
	 */
	RANGE_NOT_SATISFIABLE = 416,

	/**
	 * The server cannot meet the requirements of the Expect request-header field.
	 */
	EXPECTATION_FAILED = 417,

	/**
	 * This code was defined in 1998 as one of the traditional IETF April Fools' jokes, in RFC 2324, Hyper Text Coffee Pot Control Protocol,
	 * and is not expected to be implemented by actual HTTP servers. The RFC specifies this code should be returned by
	 * teapots requested to brew coffee. This HTTP status is used as an Easter egg in some websites, including Google.com.
	 */
	I_AM_A_TEAPOT = 418,

	/**
	 * The request was directed at a server that is not able to produce a response (for example because a connection reuse).
	 */
	MISDIRECTED_REQUEST = 421,

	/**
	 * The request was well-formed but was unable to be followed due to semantic errors.
	 */
	UNPROCESSABLE_ENTITY = 422,

	/**
	 * The resource that is being accessed is locked.
	 */
	LOCKED = 423,

	/**
	 * The request failed due to failure of a previous request (e.g., a PROPPATCH).
	 */
	FAILED_DEPENDENCY = 424,

	/**
	 * The client should switch to a different protocol such as TLS/1.0, given in the Upgrade header field.
	 */
	UPGRADE_REQUIRED = 426,

	/**
	 * The origin server requires the request to be conditional.
	 * Intended to prevent "the 'lost update' problem, where a client
	 * GETs a resource's state, modifies it, and PUTs it back to the server,
	 * when meanwhile a third party has modified the state on the server, leading to a conflict."
	 */
	PRECONDITION_REQUIRED = 428,

	/**
	 * The user has sent too many requests in a given amount of time. Intended for use with rate-limiting schemes.
	 */
	TOO_MANY_REQUESTS = 429,

	/**
	 * The server is unwilling to process the request because either an individual header field,
	 * or all the header fields collectively, are too large.
	 */
	REQUEST_HEADER_FIELDS_TOO_LARGE = 431,

	/**
	 * A server operator has received a legal demand to deny access to a resource or to a set of resources
	 * that includes the requested resource. The code 451 was chosen as a reference to the novel Fahrenheit 451.
	 */
	UNAVAILABLE_FOR_LEGAL_REASONS = 451,

	/**
	 * A generic error message, given when an unexpected condition was encountered and no more specific message is suitable.
	 */
	INTERNAL_SERVER_ERROR = 500,

	/**
	 * The server either does not recognize the request method, or it lacks the ability to fulfill the request.
	 * Usually this implies future availability (e.g., a new feature of a web-service API).
	 */
	NOT_IMPLEMENTED = 501,

	/**
	 * The server was acting as a gateway or proxy and received an invalid response from the upstream server.
	 */
	BAD_GATEWAY = 502,

	/**
	 * The server is currently unavailable (because it is overloaded or down for maintenance).
	 * Generally, this is a temporary state.
	 */
	SERVICE_UNAVAILABLE = 503,

	/**
	 * The server was acting as a gateway or proxy and did not receive a timely response from the upstream server.
	 */
	GATEWAY_TIMEOUT = 504,

	/**
	 * The server does not support the HTTP protocol version used in the request
	 */
	HTTP_VERSION_NOT_SUPPORTED = 505,

	/**
	 * Transparent content negotiation for the request results in a circular reference.
	 */
	VARIANT_ALSO_NEGOTIATES = 506,

	/**
	 * The server is unable to store the representation needed to complete the request.
	 */
	INSUFFICIENT_STORAGE = 507,

	/**
	 * The server detected an infinite loop while processing the request.
	 */
	LOOP_DETECTED = 508,

	/**
	 * Further extensions to the request are required for the server to fulfill it.
	 */
	NOT_EXTENDED = 510,

	/**
	 * The client needs to authenticate to gain network access.
	 * Intended for use by intercepting proxies used to control access to the network (e.g., "captive portals" used
	 * to require agreement to Terms of Service before granting full Internet access via a Wi-Fi hotspot).
	 */
	NETWORK_AUTHENTICATION_REQUIRED = 511,

	//#endregion
	
	UNKNOWN = -1,
}

export const CodeErrorMsg = {} as const

export default class CoreError extends Error {

	constructor(public code: CoreErrorCode, msg: string | undefined = (CodeErrorMsg as any)[code]) {
		super(msg)
	}
}