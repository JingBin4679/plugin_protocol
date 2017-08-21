var callback = {};
var ERROR_INVALID_PLUGIN_PROTOCOL_FILE = 1;//插件协议有问题
var ERROR_NO_PLUGIN_PAGE = 2;//插件中没有插件页面
var ERROR_NOT_FIND_THE_PLUGIN_PAGE = 3; //插件中没有对应的插件页面。

callback.onError = function (cb, code, error) {
    pluginPage = null;
    if(cb == null) {
        document.write("code = " + code + "         error = " + error);
    }
    cb.onError(code, error);
};

callback.onSuccess = function (cb, code, result) {
    pluginPage = result;
    if(cb == null) {
        document.write(obj2string(result));
    }
    cb.onSuccess(code, result);
};

function obj2string(o) {
    var r = [];
    if (o == null) {
        return '""';
    }
    if (typeof o == "string") {
        return "\"" + o.replace(/([\'\"\\])/g, "\\$1").replace(/(\n)/g, "\\n").replace(/(\r)/g, "\\r").replace(/(\t)/g, "\\t") + "\"";
    }
    if (typeof o == "object") {
        if (o == null) {
            return '""';
        }
        if (!o.sort) {
            for (var i in o) {
                r.push("\""+ i + "\""+ ":" + obj2string(o[i]));
            }
            if (!!document.all && !/^\n?function\s*toString\(\)\s*\{\n?\s*\[native code\]\n?\s*\}\n?\s*$/.test(o.toString)) {
                r.push("toString:" + o.toString.toString());
            }
            r = "{" + r.join() + "}";
        } else {
            for (var i = 0; i < o.length; i++) {
                r.push(obj2string(o[i]))
            }
            r = "[" + r.join() + "]";
        }
        return r;
    }
    return o.toString();
}


//id
//desc
//design
//screen
//type
var pluginPage = new Object();


//解析attrs
function parseAttrs(attrs) {
    if (attrs == null || attrs.length == 0) {
        return null;
    }
    var attrArr = attrs[0].getElementsByTagName("attr");
    var result = new Array();
    for (var index = 0;index < attrArr.length; ++index) {
        var a = attrArr[index];
        var attr = new Object();
        attr.name = a.getAttribute("name");
        attr.value = a.innerHTML;
        result.push(attr);
    }
    return result;
}
//解析config
function parseConfigs(configs) {
    if (configs == null || configs.length == 0) {
        return null;
    }
    var configArr = configs[0].getElementsByTagName("config");
    var result = new Array();
    for (var index = 0;index < configArr.length; ++index) {
        var c = configArr[index];
        var config = new Object();
        config.name = c.getAttribute("name");
        config.desc = c.getAttribute("desc");
        config.type = c.getAttribute("type");
        result.push(config);
    }
    return result;
}

//解析filter
function parseFilter(dataFilter) {
    if (dataFilter == null || dataFilter.length == 0) {
        return null;
    }
    var filterArr = dataFilter[0].getElementsByTagName("filter");
    var result = new Array();
    for (var index = 0;index < filterArr.length; ++index) {
        var f = filterArr[index];
        var filter = new Object();
        filter.data = f.getAttribute("data");
        result.push(filter);
    }
    return result;
}

//解析handler
function parseHandler(dataHandler) {
    if (dataHandler == null || dataHandler.length == 0) {
        return null;
    }
    var handlerArr = dataHandler[0].getElementsByTagName("handler");
    var result = new Array();
    for (var index = 0;index < handlerArr.length; ++index) {
        var h = handlerArr[index];
        var handler = new Object();
        handler.data = h.getAttribute("data");
        handler.command = h.getAttribute("command");
        handler.desc = h.getAttribute("desc");
        var hide = h.getAttribute("hide");
        if (hide === "true") {
            continue;
        }
        result.push(handler);
    }
    return result;
}

function parsePluginPageView(views, page) {
    if (views == null || views.length == 0) {
        return;
    }

    page.views = new Array();

    for (var index = 0; index < views.length; ++index) {
        var v = views[index];
        var view = new Object();
        view.desc = v.getAttribute("desc");
        view.design = v.getAttribute("design");
        view.id = v.getAttribute("id");
        view.index = v.getAttribute("index");
        view.min = v.getAttribute("min");
        view.max = v.getAttribute("max");
        view.static = v.getAttribute("static")

        var attrs = v.getElementsByTagName("attrs");
        view.attrs = parseAttrs(attrs);

        var configs = v.getElementsByTagName("configs");
        view.configs = parseConfigs(configs);

        var filters = v.getElementsByTagName("data-filter");
        view.filters = parseFilter(filters);

        page.views.push(view);
    }
}


function parsePluginProtocol(protocol, pageId, cb) {
    var domParser = new DOMParser();
    var document = domParser.parseFromString(protocol, "text/xml");
    var plugins = document.getElementsByTagName("plugin");
    if (plugins == null || plugins.length == 0) {
        callback.onError(cb, ERROR_INVALID_PLUGIN_PROTOCOL_FILE, "invalid plugin protocol file");
        return false;
    }
    var plugin = plugins[0];

    var pages = plugin.getElementsByTagName("page");
    if (pages == null || pages.length == 0) {
        callback.onError(cb, ERROR_NO_PLUGIN_PAGE, "this plugin has no page");
        return false;
    }
    var targetPage;
    for (var index = 0; index < pages.length; ++index) {
        var page = pages[index];
        if (page != null && page.getAttribute("id") == pageId) {
            targetPage = page;
            break;
        }
    }
    if (targetPage == null) {
        callback.onError(cb, ERROR_NOT_FIND_THE_PLUGIN_PAGE);
        return false;
    }
    var page = new Object();
    page.id = targetPage.getAttribute("id");
    page.desc = targetPage.getAttribute("desc");
    page.screen = targetPage.getAttribute("screen");
    page.type = targetPage.getAttribute("type");
    page.design = targetPage.getAttribute("design");

    var views = targetPage.getElementsByTagName("view");
    parsePluginPageView(views, page);

    var attrs = targetPage.getElementsByTagName("attrs");
    page.attrs = parseAttrs(attrs);

    var configs = targetPage.getElementsByTagName("configs");
    page.configs = parseConfigs(configs);

    var filters = targetPage.getElementsByTagName("data-filter");
    page.filters = parseFilter(filters);

    var handlers = targetPage.getElementsByTagName("data-handler");
    page.handlers = parseHandler(handlers);

    callback.onSuccess(cb, 0, page);
    return true;
}

function getAllViewItem() {
    if(pluginPage == null) {
        return null;
    }
    return pluginPage.views;

}