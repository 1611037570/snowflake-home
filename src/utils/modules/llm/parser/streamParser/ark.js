const event = `event: response.created
data: {"type":"response.created","response":{"created_at":1775418249,"id":"resp_0217754182490861cf45d11d421f4f872a8e52de4f86b4fb3b7e0","max_output_tokens":32768,"model":"doubao-seed-2-0-mini-260215","object":"response","service_tier":"default","caching":{"type":"disabled"},"store":true,"expire_at":1775677449},"sequence_number":0}

event: response.in_progress
data: {"type":"response.in_progress","response":{"created_at":1775418249,"id":"resp_0217754182490861cf45d11d421f4f872a8e52de4f86b4fb3b7e0","max_output_tokens":32768,"model":"doubao-seed-2-0-mini-260215","object":"response","service_tier":"default","caching":{"type":"disabled"},"store":true,"expire_at":1775677449},"sequence_number":1}

event: response.output_item.added
data: {"type":"response.output_item.added","output_index":0,"item":{"id":"rs_02177541824941400000000000000000000ffffac1827e2df79d1","type":"reasoning","status":"in_progress"},"sequence_number":2}

event: response.reasoning_summary_part.added
data: {"type":"response.reasoning_summary_part.added","item_id":"rs_02177541824941400000000000000000000ffffac1827e2df79d1","output_index":0,"summary_index":0,"part":{"type":"summary_text"},"sequence_number":3}

event: response.reasoning_summary_text.delta
data: {"type":"response.reasoning_summary_text.delta","summary_index":0,"delta":"用户","item_id":"rs_02177541824941400000000000000000000ffffac1827e2df79d1","output_index":0,"sequence_number":4}

event: response.reasoning_summary_text.delta
data: {"type":"response.reasoning_summary_text.delta","summary_index":0,"delta":"现在","item_id":"rs_02177541824941400000000000000000000ffffac1827e2df79d1","output_index":0,"sequence_number":5}

event: response.reasoning_summary_text.delta
data: {"type":"response.reasoning_summary_text.delta","summary_index":0,"delta":"问","item_id":"rs_02177541824941400000000000000000000ffffac1827e2df79d1","output_index":0,"sequence_number":6}

event: response.reasoning_summary_text.delta
data: {"type":"response.reasoning_summary_text.delta","summary_index":0,"delta":"现在","item_id":"rs_02177541824941400000000000000000000ffffac1827e2df79d1","output_index":0,"sequence_number":7}

event: response.reasoning_summary_text.delta
data: {"type":"response.reasoning_summary_text.delta","summary_index":0,"delta":"星期","item_id":"rs_02177541824941400000000000000000000ffffac1827e2df79d1","output_index":0,"sequence_number":8}

event: response.reasoning_summary_text.delta
data: {"type":"response.reasoning_summary_text.delta","summary_index":0,"delta":"几","item_id":"rs_02177541824941400000000000000000000ffffac1827e2df79d1","output_index":0,"sequence_number":9}

event: response.reasoning_summary_text.delta
data: {"type":"response.reasoning_summary_text.delta","summary_index":0,"delta":"，","item_id":"rs_02177541824941400000000000000000000ffffac1827e2df79d1","output_index":0,"sequence_number":10}

event: response.reasoning_summary_text.delta
data: {"type":"response.reasoning_summary_text.delta","summary_index":0,"delta":"之前","item_id":"rs_02177541824941400000000000000000000ffffac1827e2df79d1","output_index":0,"sequence_number":11}

event: response.reasoning_summary_text.delta
data: {"type":"response.reasoning_summary_text.delta","summary_index":0,"delta":"已经","item_id":"rs_02177541824941400000000000000000000ffffac1827e2df79d1","output_index":0,"sequence_number":12}

event: response.reasoning_summary_text.delta
data: {"type":"response.reasoning_summary_text.delta","summary_index":0,"delta":"回复","item_id":"rs_02177541824941400000000000000000000ffffac1827e2df79d1","output_index":0,"sequence_number":13}

event: response.reasoning_summary_text.delta
data: {"type":"response.reasoning_summary_text.delta","summary_index":0,"delta":"过","item_id":"rs_02177541824941400000000000000000000ffffac1827e2df79d1","output_index":0,"sequence_number":14}

event: response.reasoning_summary_text.delta
data: {"type":"response.reasoning_summary_text.delta","summary_index":0,"delta":"没办法","item_id":"rs_02177541824941400000000000000000000ffffac1827e2df79d1","output_index":0,"sequence_number":15}

event: response.reasoning_summary_text.delta
data: {"type":"response.reasoning_summary_text.delta","summary_index":0,"delta":"获取","item_id":"rs_02177541824941400000000000000000000ffffac1827e2df79d1","output_index":0,"sequence_number":16}

event: response.reasoning_summary_text.delta
data: {"type":"response.reasoning_summary_text.delta","summary_index":0,"delta":"实时","item_id":"rs_02177541824941400000000000000000000ffffac1827e2df79d1","output_index":0,"sequence_number":17}

event: response.reasoning_summary_text.delta
data: {"type":"response.reasoning_summary_text.delta","summary_index":0,"delta":"时间","item_id":"rs_02177541824941400000000000000000000ffffac1827e2df79d1","output_index":0,"sequence_number":18}

event: response.reasoning_summary_text.delta
data: {"type":"response.reasoning_summary_text.delta","summary_index":0,"delta":"，","item_id":"rs_02177541824941400000000000000000000ffffac1827e2df79d1","output_index":0,"sequence_number":19}

event: response.reasoning_summary_text.delta
data: {"type":"response.reasoning_summary_text.delta","summary_index":0,"delta":"需要","item_id":"rs_02177541824941400000000000000000000ffffac1827e2df79d1","output_index":0,"sequence_number":20}

event: response.reasoning_summary_text.delta
data: {"type":"response.reasoning_summary_text.delta","summary_index":0,"delta":"让","item_id":"rs_02177541824941400000000000000000000ffffac1827e2df79d1","output_index":0,"sequence_number":21}

event: response.reasoning_summary_text.delta
data: {"type":"response.reasoning_summary_text.delta","summary_index":0,"delta":"用户","item_id":"rs_02177541824941400000000000000000000ffffac1827e2df79d1","output_index":0,"sequence_number":22}

event: response.reasoning_summary_text.delta
data: {"type":"response.reasoning_summary_text.delta","summary_index":0,"delta":"看","item_id":"rs_02177541824941400000000000000000000ffffac1827e2df79d1","output_index":0,"sequence_number":23}

event: response.reasoning_summary_text.delta
data: {"type":"response.reasoning_summary_text.delta","summary_index":0,"delta":"自己","item_id":"rs_02177541824941400000000000000000000ffffac1827e2df79d1","output_index":0,"sequence_number":24}

event: response.reasoning_summary_text.delta
data: {"type":"response.reasoning_summary_text.delta","summary_index":0,"delta":"设备","item_id":"rs_02177541824941400000000000000000000ffffac1827e2df79d1","output_index":0,"sequence_number":25}

event: response.reasoning_summary_text.delta
data: {"type":"response.reasoning_summary_text.delta","summary_index":0,"delta":"的","item_id":"rs_02177541824941400000000000000000000ffffac1827e2df79d1","output_index":0,"sequence_number":26}

event: response.reasoning_summary_text.delta
data: {"type":"response.reasoning_summary_text.delta","summary_index":0,"delta":"日历","item_id":"rs_02177541824941400000000000000000000ffffac1827e2df79d1","output_index":0,"sequence_number":27}

event: response.reasoning_summary_text.delta
data: {"type":"response.reasoning_summary_text.delta","summary_index":0,"delta":"或者","item_id":"rs_02177541824941400000000000000000000ffffac1827e2df79d1","output_index":0,"sequence_number":28}

event: response.reasoning_summary_text.delta
data: {"type":"response.reasoning_summary_text.delta","summary_index":0,"delta":"时钟","item_id":"rs_02177541824941400000000000000000000ffffac1827e2df79d1","output_index":0,"sequence_number":29}

event: response.reasoning_summary_text.delta
data: {"type":"response.reasoning_summary_text.delta","summary_index":0,"delta":"。","item_id":"rs_02177541824941400000000000000000000ffffac1827e2df79d1","output_index":0,"sequence_number":30}

event: response.reasoning_summary_text.delta
data: {"type":"response.reasoning_summary_text.delta","summary_index":0,"delta":"首先","item_id":"rs_02177541824941400000000000000000000ffffac1827e2df79d1","output_index":0,"sequence_number":31}

event: response.reasoning_summary_text.delta
data: {"type":"response.reasoning_summary_text.delta","summary_index":0,"delta":"要","item_id":"rs_02177541824941400000000000000000000ffffac1827e2df79d1","output_index":0,"sequence_number":32}

event: response.reasoning_summary_text.delta
data: {"type":"response.reasoning_summary_text.delta","summary_index":0,"delta":"保持","item_id":"rs_02177541824941400000000000000000000ffffac1827e2df79d1","output_index":0,"sequence_number":33}

event: response.reasoning_summary_text.delta
data: {"type":"response.reasoning_summary_text.delta","summary_index":0,"delta":"友好","item_id":"rs_02177541824941400000000000000000000ffffac1827e2df79d1","output_index":0,"sequence_number":34}

event: response.reasoning_summary_text.delta
data: {"type":"response.reasoning_summary_text.delta","summary_index":0,"delta":"的","item_id":"rs_02177541824941400000000000000000000ffffac1827e2df79d1","output_index":0,"sequence_number":35}

event: response.reasoning_summary_text.delta
data: {"type":"response.reasoning_summary_text.delta","summary_index":0,"delta":"语气","item_id":"rs_02177541824941400000000000000000000ffffac1827e2df79d1","output_index":0,"sequence_number":36}

event: response.reasoning_summary_text.delta
data: {"type":"response.reasoning_summary_text.delta","summary_index":0,"delta":"，","item_id":"rs_02177541824941400000000000000000000ffffac1827e2df79d1","output_index":0,"sequence_number":37}

event: response.reasoning_summary_text.delta
data: {"type":"response.reasoning_summary_text.delta","summary_index":0,"delta":"再次","item_id":"rs_02177541824941400000000000000000000ffffac1827e2df79d1","output_index":0,"sequence_number":38}

event: response.reasoning_summary_text.delta
data: {"type":"response.reasoning_summary_text.delta","summary_index":0,"delta":"说明","item_id":"rs_02177541824941400000000000000000000ffffac1827e2df79d1","output_index":0,"sequence_number":39}

event: response.reasoning_summary_text.delta
data: {"type":"response.reasoning_summary_text.delta","summary_index":0,"delta":"没法","item_id":"rs_02177541824941400000000000000000000ffffac1827e2df79d1","output_index":0,"sequence_number":40}

event: response.reasoning_summary_text.delta
data: {"type":"response.reasoning_summary_text.delta","summary_index":0,"delta":"获取","item_id":"rs_02177541824941400000000000000000000ffffac1827e2df79d1","output_index":0,"sequence_number":41}

event: response.reasoning_summary_text.delta
data: {"type":"response.reasoning_summary_text.delta","summary_index":0,"delta":"实时","item_id":"rs_02177541824941400000000000000000000ffffac1827e2df79d1","output_index":0,"sequence_number":42}

event: response.reasoning_summary_text.delta
data: {"type":"response.reasoning_summary_text.delta","summary_index":0,"delta":"信息","item_id":"rs_02177541824941400000000000000000000ffffac1827e2df79d1","output_index":0,"sequence_number":43}

event: response.reasoning_summary_text.delta
data: {"type":"response.reasoning_summary_text.delta","summary_index":0,"delta":"，","item_id":"rs_02177541824941400000000000000000000ffffac1827e2df79d1","output_index":0,"sequence_number":44}

event: response.reasoning_summary_text.delta
data: {"type":"response.reasoning_summary_text.delta","summary_index":0,"delta":"然后","item_id":"rs_02177541824941400000000000000000000ffffac1827e2df79d1","output_index":0,"sequence_number":45}

event: response.reasoning_summary_text.delta
data: {"type":"response.reasoning_summary_text.delta","summary_index":0,"delta":"告诉","item_id":"rs_02177541824941400000000000000000000ffffac1827e2df79d1","output_index":0,"sequence_number":46}

event: response.reasoning_summary_text.delta
data: {"type":"response.reasoning_summary_text.delta","summary_index":0,"delta":"他们","item_id":"rs_02177541824941400000000000000000000ffffac1827e2df79d1","output_index":0,"sequence_number":47}

event: response.reasoning_summary_text.delta
data: {"type":"response.reasoning_summary_text.delta","summary_index":0,"delta":"怎么","item_id":"rs_02177541824941400000000000000000000ffffac1827e2df79d1","output_index":0,"sequence_number":48}

event: response.reasoning_summary_text.delta
data: {"type":"response.reasoning_summary_text.delta","summary_index":0,"delta":"查看","item_id":"rs_02177541824941400000000000000000000ffffac1827e2df79d1","output_index":0,"sequence_number":49}

event: response.reasoning_summary_text.delta
data: {"type":"response.reasoning_summary_text.delta","summary_index":0,"delta":"，","item_id":"rs_02177541824941400000000000000000000ffffac1827e2df79d1","output_index":0,"sequence_number":50}

event: response.reasoning_summary_text.delta
data: {"type":"response.reasoning_summary_text.delta","summary_index":0,"delta":"比如","item_id":"rs_02177541824941400000000000000000000ffffac1827e2df79d1","output_index":0,"sequence_number":51}

event: response.reasoning_summary_text.delta
data: {"type":"response.reasoning_summary_text.delta","summary_index":0,"delta":"手机","item_id":"rs_02177541824941400000000000000000000ffffac1827e2df79d1","output_index":0,"sequence_number":52}

event: response.reasoning_summary_text.delta
data: {"type":"response.reasoning_summary_text.delta","summary_index":0,"delta":"、","item_id":"rs_02177541824941400000000000000000000ffffac1827e2df79d1","output_index":0,"sequence_number":53}

event: response.reasoning_summary_text.delta
data: {"type":"response.reasoning_summary_text.delta","summary_index":0,"delta":"电脑","item_id":"rs_02177541824941400000000000000000000ffffac1827e2df79d1","output_index":0,"sequence_number":54}

event: response.reasoning_summary_text.delta
data: {"type":"response.reasoning_summary_text.delta","summary_index":0,"delta":"的","item_id":"rs_02177541824941400000000000000000000ffffac1827e2df79d1","output_index":0,"sequence_number":55}

event: response.reasoning_summary_text.delta
data: {"type":"response.reasoning_summary_text.delta","summary_index":0,"delta":"系统","item_id":"rs_02177541824941400000000000000000000ffffac1827e2df79d1","output_index":0,"sequence_number":56}

event: response.reasoning_summary_text.delta
data: {"type":"response.reasoning_summary_text.delta","summary_index":0,"delta":"时钟","item_id":"rs_02177541824941400000000000000000000ffffac1827e2df79d1","output_index":0,"sequence_number":57}

event: response.reasoning_summary_text.delta
data: {"type":"response.reasoning_summary_text.delta","summary_index":0,"delta":"或者","item_id":"rs_02177541824941400000000000000000000ffffac1827e2df79d1","output_index":0,"sequence_number":58}

event: response.reasoning_summary_text.delta
data: {"type":"response.reasoning_summary_text.delta","summary_index":0,"delta":"日历","item_id":"rs_02177541824941400000000000000000000ffffac1827e2df79d1","output_index":0,"sequence_number":59}

event: response.reasoning_summary_text.delta
data: {"type":"response.reasoning_summary_text.delta","summary_index":0,"delta":"APP","item_id":"rs_02177541824941400000000000000000000ffffac1827e2df79d1","output_index":0,"sequence_number":60}

event: response.reasoning_summary_text.delta
data: {"type":"response.reasoning_summary_text.delta","summary_index":0,"delta":"，","item_id":"rs_02177541824941400000000000000000000ffffac1827e2df79d1","output_index":0,"sequence_number":61}

event: response.reasoning_summary_text.delta
data: {"type":"response.reasoning_summary_text.delta","summary_index":0,"delta":"这样","item_id":"rs_02177541824941400000000000000000000ffffac1827e2df79d1","output_index":0,"sequence_number":62}

event: response.reasoning_summary_text.delta
data: {"type":"response.reasoning_summary_text.delta","summary_index":0,"delta":"就","item_id":"rs_02177541824941400000000000000000000ffffac1827e2df79d1","output_index":0,"sequence_number":63}

event: response.reasoning_summary_text.delta
data: {"type":"response.reasoning_summary_text.delta","summary_index":0,"delta":"可以","item_id":"rs_02177541824941400000000000000000000ffffac1827e2df79d1","output_index":0,"sequence_number":64}

event: response.reasoning_summary_text.delta
data: {"type":"response.reasoning_summary_text.delta","summary_index":0,"delta":"了","item_id":"rs_02177541824941400000000000000000000ffffac1827e2df79d1","output_index":0,"sequence_number":65}

event: response.reasoning_summary_text.delta
data: {"type":"response.reasoning_summary_text.delta","summary_index":0,"delta":"。","item_id":"rs_02177541824941400000000000000000000ffffac1827e2df79d1","output_index":0,"sequence_number":66}

event: response.reasoning_summary_text.delta
data: {"type":"response.reasoning_summary_text.delta","summary_index":0,"delta":"现在","item_id":"rs_02177541824941400000000000000000000ffffac1827e2df79d1","output_index":0,"sequence_number":67}

event: response.reasoning_summary_text.delta
data: {"type":"response.reasoning_summary_text.delta","summary_index":0,"delta":"组织","item_id":"rs_02177541824941400000000000000000000ffffac1827e2df79d1","output_index":0,"sequence_number":68}

event: response.reasoning_summary_text.delta
data: {"type":"response.reasoning_summary_text.delta","summary_index":0,"delta":"一下","item_id":"rs_02177541824941400000000000000000000ffffac1827e2df79d1","output_index":0,"sequence_number":69}

event: response.reasoning_summary_text.delta
data: {"type":"response.reasoning_summary_text.delta","summary_index":0,"delta":"语言","item_id":"rs_02177541824941400000000000000000000ffffac1827e2df79d1","output_index":0,"sequence_number":70}

event: response.reasoning_summary_text.delta
data: {"type":"response.reasoning_summary_text.delta","summary_index":0,"delta":"，","item_id":"rs_02177541824941400000000000000000000ffffac1827e2df79d1","output_index":0,"sequence_number":71}

event: response.reasoning_summary_text.delta
data: {"type":"response.reasoning_summary_text.delta","summary_index":0,"delta":"自然","item_id":"rs_02177541824941400000000000000000000ffffac1827e2df79d1","output_index":0,"sequence_number":72}

event: response.reasoning_summary_text.delta
data: {"type":"response.reasoning_summary_text.delta","summary_index":0,"delta":"一点","item_id":"rs_02177541824941400000000000000000000ffffac1827e2df79d1","output_index":0,"sequence_number":73}

event: response.reasoning_summary_text.delta
data: {"type":"response.reasoning_summary_text.delta","summary_index":0,"delta":"。","item_id":"rs_02177541824941400000000000000000000ffffac1827e2df79d1","output_index":0,"sequence_number":74}

event: response.reasoning_summary_text.done
data: {"type":"response.reasoning_summary_text.done","summary_index":0,"item_id":"rs_02177541824941400000000000000000000ffffac1827e2df79d1","output_index":0,"text":"用户现在问现在星期几，之前已经回复过没办法获取实时时间，需要让用户看自己设备的日历或者时钟。首先要保持友好的语气，再次说明没法获取实时信息，然后告诉他们怎么查看，比如手机、电脑的系统时钟或者日历APP，这样就可以了。现在组织一下语言，自然一点。","sequence_number":75}

event: response.reasoning_summary_part.done
data: {"type":"response.reasoning_summary_part.done","item_id":"rs_02177541824941400000000000000000000ffffac1827e2df79d1","output_index":0,"summary_index":0,"part":{"type":"summary_text","text":"用户现在问现在星期几，之前已经回复过没办法获取实时时间，需要让用户看自己设备的日历或者时钟。首先要保持友好的语气，再次说明没法获取实时信息，然后告诉他们怎么查看，比如手机、电脑的系统时钟或者日历APP，这样就可以了。现在组织一下语言，自然一点。"},"sequence_number":76}

event: response.output_item.done
data: {"type":"response.output_item.done","output_index":0,"item":{"id":"rs_02177541824941400000000000000000000ffffac1827e2df79d1","type":"reasoning","summary":[{"type":"summary_text","text":"用户现在问现在星期几，之前已经回复过没办法获取实时时间，需要让用户看自己设备的日历或者时钟。首先要保持友好的语气，再次说明没法获取实时信息，然后告诉他们怎么查看，比如手机、电脑的系统时钟或者日历APP，这样就可以了。现在组织一下语言，自然一点。"}],"status":"completed"},"sequence_number":77}

event: response.output_item.added
data: {"type":"response.output_item.added","output_index":1,"item":{"type":"message","role":"assistant","status":"in_progress","id":"msg_02177541825011200000000000000000000ffffac1827e21202d3"},"sequence_number":78}

event: response.content_part.added
data: {"type":"response.content_part.added","content_index":0,"item_id":"msg_02177541825011200000000000000000000ffffac1827e21202d3","output_index":1,"part":{"type":"output_text"},"sequence_number":79}

event: response.output_text.delta
data: {"type":"response.output_text.delta","content_index":0,"delta":"很","item_id":"msg_02177541825011200000000000000000000ffffac1827e21202d3","output_index":1,"sequence_number":80}

event: response.output_text.delta
data: {"type":"response.output_text.delta","content_index":0,"delta":"抱歉","item_id":"msg_02177541825011200000000000000000000ffffac1827e21202d3","output_index":1,"sequence_number":81}

event: response.output_text.delta
data: {"type":"response.output_text.delta","content_index":0,"delta":"呀","item_id":"msg_02177541825011200000000000000000000ffffac1827e21202d3","output_index":1,"sequence_number":82}

event: response.output_text.delta
data: {"type":"response.output_text.delta","content_index":0,"delta":"，","item_id":"msg_02177541825011200000000000000000000ffffac1827e21202d3","output_index":1,"sequence_number":83}

event: response.output_text.delta
data: {"type":"response.output_text.delta","content_index":0,"delta":"我","item_id":"msg_02177541825011200000000000000000000ffffac1827e21202d3","output_index":1,"sequence_number":84}

event: response.output_text.delta
data: {"type":"response.output_text.delta","content_index":0,"delta":"没办法","item_id":"msg_02177541825011200000000000000000000ffffac1827e21202d3","output_index":1,"sequence_number":85}

event: response.output_text.delta
data: {"type":"response.output_text.delta","content_index":0,"delta":"获取","item_id":"msg_02177541825011200000000000000000000ffffac1827e21202d3","output_index":1,"sequence_number":86}

event: response.output_text.delta
data: {"type":"response.output_text.delta","content_index":0,"delta":"实时","item_id":"msg_02177541825011200000000000000000000ffffac1827e21202d3","output_index":1,"sequence_number":87}

event: response.output_text.delta
data: {"type":"response.output_text.delta","content_index":0,"delta":"的","item_id":"msg_02177541825011200000000000000000000ffffac1827e21202d3","output_index":1,"sequence_number":88}

event: response.output_text.delta
data: {"type":"response.output_text.delta","content_index":0,"delta":"当前","item_id":"msg_02177541825011200000000000000000000ffffac1827e21202d3","output_index":1,"sequence_number":89}

event: response.output_text.delta
data: {"type":"response.output_text.delta","content_index":0,"delta":"日期","item_id":"msg_02177541825011200000000000000000000ffffac1827e21202d3","output_index":1,"sequence_number":90}

event: response.output_text.delta
data: {"type":"response.output_text.delta","content_index":0,"delta":"和","item_id":"msg_02177541825011200000000000000000000ffffac1827e21202d3","output_index":1,"sequence_number":91}

event: response.output_text.delta
data: {"type":"response.output_text.delta","content_index":0,"delta":"星期","item_id":"msg_02177541825011200000000000000000000ffffac1827e21202d3","output_index":1,"sequence_number":92}

event: response.output_text.delta
data: {"type":"response.output_text.delta","content_index":0,"delta":"信息","item_id":"msg_02177541825011200000000000000000000ffffac1827e21202d3","output_index":1,"sequence_number":93}

event: response.output_text.delta
data: {"type":"response.output_text.delta","content_index":0,"delta":"，","item_id":"msg_02177541825011200000000000000000000ffffac1827e21202d3","output_index":1,"sequence_number":94}

event: response.output_text.delta
data: {"type":"response.output_text.delta","content_index":0,"delta":"你","item_id":"msg_02177541825011200000000000000000000ffffac1827e21202d3","output_index":1,"sequence_number":95}

event: response.output_text.delta
data: {"type":"response.output_text.delta","content_index":0,"delta":"可以","item_id":"msg_02177541825011200000000000000000000ffffac1827e21202d3","output_index":1,"sequence_number":96}

event: response.output_text.delta
data: {"type":"response.output_text.delta","content_index":0,"delta":"通过","item_id":"msg_02177541825011200000000000000000000ffffac1827e21202d3","output_index":1,"sequence_number":97}

event: response.output_text.delta
data: {"type":"response.output_text.delta","content_index":0,"delta":"手机","item_id":"msg_02177541825011200000000000000000000ffffac1827e21202d3","output_index":1,"sequence_number":98}

event: response.output_text.delta
data: {"type":"response.output_text.delta","content_index":0,"delta":"、","item_id":"msg_02177541825011200000000000000000000ffffac1827e21202d3","output_index":1,"sequence_number":99}

event: response.output_text.delta
data: {"type":"response.output_text.delta","content_index":0,"delta":"电脑","item_id":"msg_02177541825011200000000000000000000ffffac1827e21202d3","output_index":1,"sequence_number":100}

event: response.output_text.delta
data: {"type":"response.output_text.delta","content_index":0,"delta":"的","item_id":"msg_02177541825011200000000000000000000ffffac1827e21202d3","output_index":1,"sequence_number":101}

event: response.output_text.delta
data: {"type":"response.output_text.delta","content_index":0,"delta":"系统","item_id":"msg_02177541825011200000000000000000000ffffac1827e21202d3","output_index":1,"sequence_number":102}

event: response.output_text.delta
data: {"type":"response.output_text.delta","content_index":0,"delta":"时钟","item_id":"msg_02177541825011200000000000000000000ffffac1827e21202d3","output_index":1,"sequence_number":103}

event: response.output_text.delta
data: {"type":"response.output_text.delta","content_index":0,"delta":"或者","item_id":"msg_02177541825011200000000000000000000ffffac1827e21202d3","output_index":1,"sequence_number":104}

event: response.output_text.delta
data: {"type":"response.output_text.delta","content_index":0,"delta":"自带","item_id":"msg_02177541825011200000000000000000000ffffac1827e21202d3","output_index":1,"sequence_number":105}

event: response.output_text.delta
data: {"type":"response.output_text.delta","content_index":0,"delta":"的","item_id":"msg_02177541825011200000000000000000000ffffac1827e21202d3","output_index":1,"sequence_number":106}

event: response.output_text.delta
data: {"type":"response.output_text.delta","content_index":0,"delta":"日历","item_id":"msg_02177541825011200000000000000000000ffffac1827e21202d3","output_index":1,"sequence_number":107}

event: response.output_text.delta
data: {"type":"response.output_text.delta","content_index":0,"delta":"应用","item_id":"msg_02177541825011200000000000000000000ffffac1827e21202d3","output_index":1,"sequence_number":108}

event: response.output_text.delta
data: {"type":"response.output_text.delta","content_index":0,"delta":"，","item_id":"msg_02177541825011200000000000000000000ffffac1827e21202d3","output_index":1,"sequence_number":109}

event: response.output_text.delta
data: {"type":"response.output_text.delta","content_index":0,"delta":"查看","item_id":"msg_02177541825011200000000000000000000ffffac1827e21202d3","output_index":1,"sequence_number":110}

event: response.output_text.delta
data: {"type":"response.output_text.delta","content_index":0,"delta":"准确","item_id":"msg_02177541825011200000000000000000000ffffac1827e21202d3","output_index":1,"sequence_number":111}

event: response.output_text.delta
data: {"type":"response.output_text.delta","content_index":0,"delta":"的","item_id":"msg_02177541825011200000000000000000000ffffac1827e21202d3","output_index":1,"sequence_number":112}

event: response.output_text.delta
data: {"type":"response.output_text.delta","content_index":0,"delta":"当前","item_id":"msg_02177541825011200000000000000000000ffffac1827e21202d3","output_index":1,"sequence_number":113}

event: response.output_text.delta
data: {"type":"response.output_text.delta","content_index":0,"delta":"是","item_id":"msg_02177541825011200000000000000000000ffffac1827e21202d3","output_index":1,"sequence_number":114}

event: response.output_text.delta
data: {"type":"response.output_text.delta","content_index":0,"delta":"星期","item_id":"msg_02177541825011200000000000000000000ffffac1827e21202d3","output_index":1,"sequence_number":115}

event: response.output_text.delta
data: {"type":"response.output_text.delta","content_index":0,"delta":"几","item_id":"msg_02177541825011200000000000000000000ffffac1827e21202d3","output_index":1,"sequence_number":116}

event: response.output_text.delta
data: {"type":"response.output_text.delta","content_index":0,"delta":"哦","item_id":"msg_02177541825011200000000000000000000ffffac1827e21202d3","output_index":1,"sequence_number":117}

event: response.output_text.delta
data: {"type":"response.output_text.delta","content_index":0,"delta":"。","item_id":"msg_02177541825011200000000000000000000ffffac1827e21202d3","output_index":1,"sequence_number":118}

event: response.output_text.done
data: {"type":"response.output_text.done","content_index":0,"item_id":"msg_02177541825011200000000000000000000ffffac1827e21202d3","output_index":1,"text":"很抱歉呀，我没办法获取实时的当前日期和星期信息，你可以通过手机、电脑的系统时钟或者自带的日历应用，查看准确的当前是星期几哦。","sequence_number":119}

event: response.content_part.done
data: {"type":"response.content_part.done","content_index":0,"item_id":"msg_02177541825011200000000000000000000ffffac1827e21202d3","output_index":1,"part":{"type":"output_text","text":"很抱歉呀，我没办法获取实时的当前日期和星期信息，你可以通过手机、电脑的系统时钟或者自带的日历应用，查看准确的当前是星期几哦。"},"sequence_number":120}

event: response.output_item.done
data: {"type":"response.output_item.done","output_index":1,"item":{"type":"message","role":"assistant","content":[{"type":"output_text","text":"很抱歉呀，我没办法获取实时的当前日期和星期信息，你可以通过手机、电脑的系统时钟或者自带的日历应用，查看准确的当前是星期几哦。"}],"status":"completed","id":"msg_02177541825011200000000000000000000ffffac1827e21202d3"},"sequence_number":121}

event: response.completed
data: {"type":"response.completed","response":{"created_at":1775418249,"id":"resp_0217754182490861cf45d11d421f4f872a8e52de4f86b4fb3b7e0","max_output_tokens":32768,"model":"doubao-seed-2-0-mini-260215","object":"response","output":[{"id":"rs_02177541824941400000000000000000000ffffac1827e2df79d1","type":"reasoning","summary":[{"type":"summary_text","text":"用户现在问现在星期几，之前已经回复过没办法获取实时时间，需要让用户看自己设备的日历或者时钟。首先要保持友好的语气，再次说明没法获取实时信息，然后告诉他们怎么查看，比如手机、电脑的系统时钟或者日历APP，这样就可以了。现在组织一下语言，自然一点。"}],"status":"completed"},{"type":"message","role":"assistant","content":[{"type":"output_text","text":"很抱歉呀，我没办法获取实时的当前日期和星期信息，你可以通过手机、电脑的系统时钟或者自带的日历应用，查看准确的当前是星期几哦。"}],"status":"completed","id":"msg_02177541825011200000000000000000000ffffac1827e21202d3"}],"service_tier":"default","status":"completed","usage":{"input_tokens":817,"output_tokens":111,"total_tokens":928,"input_tokens_details":{"cached_tokens":0},"output_tokens_details":{"reasoning_tokens":72}},"caching":{"type":"disabled"},"store":true,"expire_at":1775677449},"sequence_number":122}

data: [DONE]`
export const arkStreamParser = (line, { onEvent, debug }) => {
  // 1. 基础清理：去除首尾空格，过滤空行
  const trimmedLine = line.trim()
  if (!trimmedLine || trimmedLine === '[DONE]') {
    return { content: '', reasoning: '', usage: null }
  }

  // 2. 仅处理 SSE data 行（核心数据载体），忽略 event 行
  if (!trimmedLine.startsWith('data:')) {
    return { content: '', reasoning: '', usage: null }
  }

  try {
    // 3. 提取 data: 后的 JSON 字符串并解析
    const jsonStr = trimmedLine.replace(/^data:\s*/i, '').trim()
    // 过滤非 JSON 格式的 data 内容
    if (!jsonStr || !jsonStr.startsWith('{') || !jsonStr.endsWith('}')) {
      return { content: '', reasoning: '', usage: null }
    }
    const data = JSON.parse(jsonStr)

    // 4. 定义内容变量
    let currentOutputContent = '' // 最终输出给用户的内容
    let currentReasoningContent = '' // 模型推理过程内容
    let totalTokens = 0 // Token 消耗统计

    // 5. 匹配豆包流的核心增量事件类型
    const { type, delta } = data

    // 推理内容增量（response.reasoning_summary_text.delta）
    if (type === 'response.reasoning_summary_text.delta' && delta) {
      currentReasoningContent = delta
      onEvent?.('reasoning', currentReasoningContent)
    }
    // 输出内容增量（response.output_text.delta）
    if (type === 'response.output_text.delta' && delta) {
      currentOutputContent = delta
      onEvent?.('content', currentOutputContent)
    }

    // 处理 Token 消耗 (response.completed)
    if (type === 'response.completed' && data.response?.usage) {
      totalTokens = data.response.usage.total_tokens
      onEvent?.('total_tokens', totalTokens)
    }

    // 6. 调试日志
    if (debug) {
      currentReasoningContent && console.log('🔍 当前推理增量:', currentReasoningContent)
      currentOutputContent && console.log('💬 当前输出增量:', currentOutputContent)
      totalTokens && console.log('📊 Token 消耗:', totalTokens)
    }

    // 7. 返回增量内容和统计
    return {
      content: currentOutputContent,
      reasoning: currentReasoningContent,
      total_tokens: totalTokens,
    }
  } catch (error) {
    if (debug) {
      console.error('❌ 豆包流解析失败:', { line: trimmedLine, error })
    }
    // 非关键错误不抛出，避免流中断
    return { content: '', reasoning: '', usage: null }
  }
}
