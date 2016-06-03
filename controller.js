/*
 myGitHubBlog
 (c) 2016 Jean-Francois Landreau http://github.com/jeffeland
 License: MIT
 */
'use strict';

var dataUrl = "./data/";
var hostname = window.location.hostname;
if(hostname.endsWith("github.io")) {
   var path1 = hostname.replace(".github.io", "");
   var path2 = window.location.pathname.substring(1, window.location.pathname.length);
   path2 = path2.substr(0, path2.indexOf("/") + 1);
   var dataUrl = "https://github.com/" + path1 + "/" + path2 + "tree/data/";
}

marked.setOptions({
    highlight: function (code) {
        return hljs.highlightAuto(code).value;
    }
});

var g_toc = null;

var app = angular.module('app', ['ngRoute']);

app.config(['$routeProvider',
    function ($routeProvider) {
        $routeProvider.
            when('/author', {
                templateUrl: 'author.html',
                controller: 'author'
            }).
            when('/toc', {
                templateUrl: 'toc.html',
                controller: 'toc'
            }).
            when('/blogpost/:blogPostId', {
                templateUrl: 'blog-post.html',
                controller: 'blogPost'
            }).
            otherwise({
                redirectTo: '/toc'
            });
    }]);

app.controller('author', function ($scope, $http, $sce) {
    $http.jsonp(dataUrl + 'author.md?callback=JSON_CALLBACK').success(function (authorDetails) {
        $scope.authorDetails = $sce.trustAsHtml(marked(authorDetails));
    });
});

app.controller('toc', function ($scope, $http) {
    if(g_toc  == null)
    {
        $http.jsonp(dataUrl + 'toc.json?callback=JSON_CALLBACK').success(function (l_toc) {
            g_toc = l_toc;
            $scope.toc = g_toc;
        })
    }
    else {
        $scope.toc = g_toc;
    }
});


app.controller('blogPost', function ($scope, $http, $routeParams, $sce) {
    function setBlogPostData()
    {
        for (var i = 0; i < g_toc.length; i++) {
            if (g_toc[i].id == $routeParams.blogPostId) {
                var blogPost = g_toc[i];
                if(typeof(blogPost.content) == "string")
                {
                    $http.jsonp('./data/' + blogPost.content + '?callback=JSON_CALLBACK').success(function (blogContent) {
                        blogPost.content = $sce.trustAsHtml(marked(blogContent));
                        $scope.blogPost = blogPost;
                    });
                }
                else
                {
                    $scope.blogPost = blogPost;
                }
                break;
            }
        }
    }

    if(g_toc  == null) {
        delete $http.defaults.headers.common['X-Requested-With'];
        $http.jsonp(dataUrl + 'toc.json?callback=JSON_CALLBACK').success(function (l_toc) {
            g_toc = l_toc;
            setBlogPostData();
        })
    }
    else {
        setBlogPostData();
    }
});
