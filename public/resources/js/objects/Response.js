/**
 * Class used to create AJAX responses
 *
 * @author mauricio.araldi
 * @since 0.2.0
 */
export default class Response {
	constructor(status, message, data, page) {
		this.status = status;
		this.message = message;
		this.data = JSON.stringify(data);
		this.page = page;
	}
}