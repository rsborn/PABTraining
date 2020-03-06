
/**
* Helper.js.
* This file contains is a subset of the helper functions from the Demo program.
*
*/

/**
* This calls the Session Api exit function to exit EIP mode.
*/
function exit()
{
	xrxSessionExitApplication( "http://127.0.0.1", callbackFailure );
}

/**
* Function to replace characters in a string. Replacement is global. Necessary as current 
* browser has problems with String.replace().
*
* @param text	string to modify
* @param str	string to search for
* @param rstr	replacement string
* @return modified string
*/
function replaceChars( text, str, rstr )
{
	var index = text.indexOf( str );
	var result = "";
	while(index >= 0) 
	{
		result += ((index > 0)?text.substring( 0, index ):"");
		result += rstr;
		text = text.substring( index + str.length, text.length );
		index = text.indexOf( str );
	}
	return( result + text );
}

/**
* Function to find the nth occurence of a character in a string.
*
* @param string	string to search
* @param charr	char to search for
* @param nth	occurence of character in string
* @return location of nth character in string
*/
function nth_occurrence (string, charr, nth)
{
	var first_index = string.indexOf(charr);
	var length_up_to_first_index = first_index + 1;
	if (nth == 1) {
		return first_index;
	} else {
		var string_after_first_occurrence = string.slice(length_up_to_first_index);
		var next_occurrence = nth_occurrence(string_after_first_occurrence, charr, nth - 1);
		if (next_occurrence === -1)
		{
			return -1;
		} else {
			return length_up_to_first_index + next_occurrence;  
		}
	}
}

/**
* Lazy function that makes alot of assumptions on the request structure to find the request name.
*
* @param request	request string to pull name from
* @return the name of the request
*/
function getRequestName(request)
{
	var requestNameStart = request.indexOf("<soap:Body>") + 12;
	var requestNameEnd = request.indexOf(">", requestNameStart);
	if (request.indexOf(" ", requestNameStart) < requestNameEnd) requestNameEnd = request.indexOf(" ", requestNameStart);
	
	return request.substring(requestNameStart, requestNameEnd)
}

/**
* Lazy function that makes alot of assumptions on the response structure to find the FailedReason.
*
* @param response	response string to pull FailedReason
* @return the reason the request failed
*/
function getFailedReason(response)
{
	var failedReasonStart = response.indexOf("<faultstring>") + 13;
	var failedReasonEnd = response.indexOf("</faultstring>", failedReasonStart);
	if (failedReasonEnd < 0)
	{
		failedReasonStart = response.indexOf("<SOAP-ENV:Detail>") + 17;
		failedReasonEnd = response.indexOf("</SOAP-ENV:Detail>", failedReasonStart);
		if (failedReasonEnd < 0)
		{
			failedReasonStart = response.indexOf("<Fault") + 758;
			failedReasonEnd = response.indexOf("</Fault>", failedReasonStart);
		}
	}
	
	return xrxUnescape(response.substring(failedReasonStart, failedReasonEnd));
}

/**
* Function to escape the unescaped characters in a xml payload.
*
* @param text	string to modify
*/
function xrxEscape( text )
{
	text = xrxReplaceChars( text, "<", "&lt;");
	text = xrxReplaceChars( text, ">", "&gt;");
	text = xrxReplaceChars( text, "\"", "&quot;");
	return text;
}

/**
* Function to clean a node tree. Clean here refers to removing any comment nodes
* as well as any text nodes that are just whitespace
*
* @param node	node to clean
*/
function clean(node)
{
  for(var n = 0; n < node.childNodes.length; n ++)
  {
	var child = node.childNodes[n];
	if
	(
	  child.nodeType === 8 
	  || 
	  (child.nodeType === 3 && !/\S/.test(child.nodeValue))
	)
	{
	  node.removeChild(child);
	  n --;
	}
	else if(child.nodeType === 1)
	{
	  clean(child);
	}
  }
}