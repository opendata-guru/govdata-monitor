var parents = (function () {
    var idParents = 'parents';

    function init() {
        var css = '';

        css += '.parent-diagram {margin:0 auto;width:max-content;}';
        css += '.parent-diagram ul {display:flex;padding:.75rem 0 0 0;position:relative;}';
        css += '.parent-diagram ul::before {border-left:1px solid #17a2b8;content:"";height:.75rem;left:50%;position:absolute;top:0;width:0;}';
        css += '.parent-diagram > ul::before {border:none;}';
        css += '.parent-diagram li {float:left;list-style-type:none;padding:.75rem .2rem 0 .2rem;position:relative;text-align:center;}';
        css += '.parent-diagram li:only-child {flex:auto;padding-top:0;}';
        css += '.parent-diagram li::after, .parent-diagram li::before {border-top:1px solid #17a2b8;content:"";height:.75rem;position:absolute;top:0;width:50%;}';
        css += '.parent-diagram li:only-child::after, .parent-diagram li:only-child::before {display:none;}';
        css += '.parent-diagram li::after {left:50%;}';
        css += '.parent-diagram li::before {right:50%;}';
        css += '.parent-diagram li:first-child::after {border-radius:.5rem 0 0 0;border-left:1px solid #17a2b8;}';
        css += '.parent-diagram li:first-child::before {border:none;}';
        css += '.parent-diagram li:last-child::before {border-radius:0 .5rem 0 0;border-right:1px solid #17a2b8;}';
        css += '.parent-diagram li:last-child::after {border:none;}';
        css += '.parent-diagram a {border:1px solid #17a2b8;border-radius:.25rem;color:#17a2b8 !important;display:inline-block;font-size:.8rem;padding:.25rem .5rem;text-decoration:none;}';
        css += '.parent-diagram a.end {background:#a4e9f4;pointer-events:none;}';
        css += '.parent-diagram a:hover {background:#49d3e9;color:#fff !important;}';

        const style = document.createElement('style');
        style.textContent = css;
        document.head.append(style);
    }

    function funcUpdate() {
        document.getElementById(idParents).innerHTML = getParents(catalog.id);
    }

    function getDeeper(id) {
        var ret = [];
        var catalogObject = catalog.get(id);

        if (catalogObject) {
            ret = getDeeper(catalogObject.packagesInId);
            var obj = {
                id: id,
                title: catalogObject.title,
            };
            ret.push(obj);
        }

        return ret;
    }

    function getAsList(id) {
        var list = [];

        var sameAs = catalog.getSameAs(id);
        if (sameAs.length > 0) {
            sameAs.forEach((sameID) => {
                list.push(getDeeper(sameID));
            });
        }

        list.sort(function(a, b) {
            var s = '', t = '';

            a.forEach((item) => s += item.id + '|');
            b.forEach((item) => t += item.id + '|');

            return a < b ? -1 : a > b ? 1 : 0;
        });

        return list;
    }

    function getAsTree(list) {
        var tree = [];

        list.forEach((path) => {
            var children = tree;
            path.forEach((item) => {
                children.push({
                    children: [],
                    id: item.id,
                    title: item.title,
                });
                children = children[children.length - 1].children;
            });
        });

        return tree;
    }

    function getSimplifiedTree(tree) {
        for (var t = 1; t < tree.length; ++t) {
            if (tree[t - 1].id === tree[t].id) {
                tree[t - 1].children = [].concat(tree[t - 1].children, tree[t].children)
                tree.splice(t, 1);
                t = 0;
            }
        }

        tree.forEach((branch) => {
            branch.children = getSimplifiedTree(branch.children);
        });

        return tree;
    }

    function format(data, isRoot) {
        var ret = '';

        if (data.length) {
            ret += '<ul>';
            data.forEach((item) => {
                if (item.children.length === 0) {
                    ret += '<li>';
                    ret += '<a class="end">' + item.title + '</a>';
                    ret += '</li>';
                } else {
                    ret += '<li>';
                    ret += '<a onclick="catalog.set(\'' + item.id + '\')">' + item.title + '</a>';
                    ret += format(item.children, false);
                    ret += '</li>';
                }
            });

            ret += '</ul>';
        }

        return ret;
    }

    function getParents(id) {
        var ret = '';

        ret += '<div class="parent-diagram">';
        ret += format(getSimplifiedTree(getAsTree(getAsList(id))), true);
        ret += '<div style="clear:both"></div>';
        ret += '</div>';

        return ret;
    }

    init();

    return {
        update: funcUpdate,
    };
}());